import { FernRegistryClient } from "@fern-fern/paged-generators-sdk";
import { Env } from "@libs/env";
import { execFernCli } from "@libs/fern";
import { cloneRepo, configureGit, setupGithubApp } from "@libs/github";
import { EmitterWebhookEvent } from "@octokit/webhooks";
import execa from "execa";
import { App } from "octokit";
import { markCheckInProgress, updateCheck } from "./utilities";
import { Octokit } from "octokit";
import { type Repository } from "@libs/github/utilities";
import { join } from "path";

interface OctokitMetadata {
    octokit: Octokit;
    repository: Repository;
}

// Try to persist this in memory for the lambda
const repoNameToInstallationId: Map<string, OctokitMetadata> = new Map();

async function setRepoInstallationMap(app: App) {
    await app.eachRepository((installation) => {
        repoNameToInstallationId.set(installation.repository.full_name, {
            octokit: installation.octokit,
            repository: installation.repository,
        });
    });
}

async function getInstallationFromRepo(repoFullName: string, app: App): Promise<OctokitMetadata | undefined> {
    // Fetch from map, unless map is empty, indicating it's not been initialized, then hydrate it and return the value
    if (repoNameToInstallationId.size == 0) {
        await setRepoInstallationMap(app);
    }
    return repoNameToInstallationId.get(repoFullName);
}

export async function handleIncomingRequest(request: Request, env: Env): Promise<Response> {
    const application: App = setupGithubApp(env);
    // Setup your in memory map of the repos
    await setRepoInstallationMap(application);
    // Process the incoming events
    await actionWebhook(application, env);

    try {
        // Verify the incoming webhook before proceeding
        await verifySignature(application, request);

        return new Response("{ 'ok': true }", {
            headers: { "content-type": "application/json" },
        });
    } catch (error) {
        return new Response(`{ "error": "${error}" }`, {
            status: 500,
            headers: { "content-type": "application/json" },
        });
    }
}

const verifySignature = async (app: App, request: Request): Promise<void> => {
    const eventName = request.headers.get("X-GitHub-Event");
    if (eventName == null) {
        throw new Error("Missing X-GitHub-Event header");
    }
    await app.webhooks.verifyAndReceive({
        id: request.headers.get("X-GitHub-Delivery") ?? "x-github-delivery",
        // @ts-expect-error: octokit does not export the type needed here to be able to cast
        name: eventName,
        signature: request.headers.get("X-Hub-Signature-256")?.replace(/sha256=/, "") ?? "",
        payload: await request.json(),
    });
};

interface RunId {
    // TODO: This should become some union of strings/enums of possible actions we can switch on in the check_run function
    action: "sdk_preview";
    organizationId: string;
    githubRepositoryFullName: string | undefined;

    // Also the docker image for the generator
    generatorDockerImage: string;
    groupName: string;
    apiName: string | undefined;
}

function stringifyRunId(runId: RunId): string {
    return JSON.stringify(runId);
}

function deserializeRunId(stringifiedRunId: string): RunId {
    // TODO: we should throw here if it cannot deserialize correctly
    return JSON.parse(stringifiedRunId) as RunId;
}

const actionWebhook = async (app: App, env: Env): Promise<void> => {
    app.log.info("Listening for webhooks");

    // Adding checks for preview as outlined in
    // https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-ci-checks-with-a-github-app
    //
    // With this event, github is saying that a repo this app is installed on has a commit that should be running checks
    // We check that it is a Fern config repo and then declare to github that we will be running SDK previews if so
    app.webhooks.on("check_suite", async (context) => {
        const action = context.payload.action;
        if (action === "requested" || action === "rerequested") {
            app.log.info(`A check run was requested: ${action}`);

            // TODO: Check that it's a fern config repo
            // Then actually create a check run SDK per-repo
            await app.octokit.rest.checks.create({
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                owner: context.payload.repository.owner.name!,
                repo: context.payload.repository.name,
                name: "🌿 SDK Preview",
                head_sha: context.payload.check_suite.head_sha,
                // TODO: fill this out with the repo data
                external_id: stringifyRunId({
                    action: "sdk_preview",
                    organizationId: "",
                    githubRepositoryFullName: "",
                    generatorDockerImage: "",
                    groupName: "",
                    apiName: "",
                }),
            });
        }
    });

    // With this event, github is telling us that a check run has officially been kicked off
    //
    // Note we do not want to use `actions` or `details_url` right now as actions issues
    // a response back to us which we don't currently need, and the details_url would be to
    // link to an external resource, as Chromatic does
    //
    // TODO: `actions` would be a good vector for kicking off a release after viewing the preview, etc.
    app.webhooks.on("check_run", async (context) => {
        // Now you know you've been given a check to run
        const action = context.payload.action;

        if (action === "rerequested" || action === "created") {
            const runId = deserializeRunId(context.payload.check_run.external_id);

            // Add new run actions here:
            switch (runId.action) {
                case "sdk_preview":
                    await runSdkPreview({
                        context,
                        app,
                        fernBotLoginName: env.GITHUB_APP_LOGIN_NAME,
                        fernBotLoginId: env.GITHUB_APP_LOGIN_ID,
                        runId,
                        fdrUrl: env.DEFAULT_FDR_ORIGIN,
                    });
                    break;
                default:
                    await runDefaultAction({ context, app });
            }
        }
    });
};

// We want to:
//  1. Update the status to in_progress
//  2. Pull the config repo
//  3. Run `fern generate --preview --group ${} --generator ${} --api ${}`
//  4. Kick off the checks (from generator CRUD API)
//  5. If there's a repo, push a branch to that repo
//  6. Complete the action with the checks status
//    6a. Include detailed logs in the `output` block
async function runSdkPreview({
    context,
    app,
    fernBotLoginName,
    fernBotLoginId,
    runId,
    fdrUrl,
}: {
    context: EmitterWebhookEvent<"check_run">;
    app: App;
    fernBotLoginName: string;
    fernBotLoginId: string;
    runId: RunId;
    fdrUrl: string;
}) {
    // Tell github we're working on this now
    await markCheckInProgress({ context, app });
    if (context.payload.installation == null) {
        await updateCheck({
            context,
            app,
            status: "completed",
            conclusion: "failure",
            output: {
                title: "No installation found",
                summary: "🌱 The Fern bot app was unable to determine the installation, and could not run checks. 😵",
                text: undefined,
            },
        });
        return;
    }

    const fdrClient = new FernRegistryClient({ environment: fdrUrl });
    const { generatorDockerImage, groupName, apiName, githubRepositoryFullName } = runId;
    // ==== DO THE ACTUAL ACTION ====
    const octokit = await app.getInstallationOctokit(context.payload.installation.id);
    const repository = context.payload.repository;
    const [git, fullRepoPath] = await configureGit(repository);
    // Get the config repo
    await cloneRepo(git, repository, octokit, fernBotLoginName, fernBotLoginId);
    // Generate preview
    let previewCommand = `generate --group ${groupName}`;
    if (apiName != null) {
        previewCommand += ` --api ${apiName}`;
    }
    await execFernCli(previewCommand, fullRepoPath, true);
    // Kick off the checks + compile a summary
    const generatorEntity = await fdrClient.generators.getGeneratorByImage({ dockerImage: generatorDockerImage });
    if (generatorEntity == null || generatorEntity.scripts == null) {
        await runDefaultAction({ context, app });
        return;
    }
    const { preInstallScript, installScript, compileScript, testScript } = generatorEntity.scripts;

    let details: string | undefined;
    let totalTasks = 0;
    let failedTasks = 0;
    if (preInstallScript != null) {
        totalTasks++;
        const [log, didFail] = await runScriptAndCollectOutput(preInstallScript.steps, "Setup");
        if (didFail) {
            failedTasks++;
        }
        details += log + "\n\n";
    }
    if (installScript != null) {
        totalTasks++;
        const [log, didFail] = await runScriptAndCollectOutput(installScript.steps, "Install");
        if (didFail) {
            failedTasks++;
        }
        details += log + "\n\n";
    }
    if (compileScript != null) {
        const [log, didFail] = await runScriptAndCollectOutput(compileScript.steps, "Compile");
        if (didFail) {
            failedTasks++;
        }
        details += log + "\n\n";
    }
    if (testScript != null) {
        const [log, didFail] = await runScriptAndCollectOutput(testScript.steps, "Test");
        if (didFail) {
            failedTasks++;
        }
        details += log + "\n\n";
    }

    // Push the preview to a new branch
    // HACK HACK: we should likely add a command to the CLI that spits out the preview path, since it's the one
    // downloading the preview repo to disk
    let previewUrl: string | undefined;
    if (githubRepositoryFullName != null) {
        let relativePathToPreview = `./.preview/${generatorDockerImage.replace("fernapi/", "")}`;
        if (apiName != null) {
            relativePathToPreview = join(`./apis/${apiName}`, relativePathToPreview);
        }
        relativePathToPreview = join(fullRepoPath, "fern", relativePathToPreview);
        previewUrl = await setRemoteAndPush(githubRepositoryFullName, relativePathToPreview, app);
    }
    // ====== ACTION COMPLETE ======

    // Tell github we're done and deliver the deets
    let summary = `### 🌱 ${generatorEntity.generatorLanguage ?? "SDK"} Preview Checks - ${failedTasks}/${totalTasks} ${failedTasks > 0 ? "❌" : "✅"}\n\n`;
    if (previewUrl != null) {
        summary += `**[🔗 Generated Preview Link 🔗](${previewUrl})**`;
    }
    await updateCheck({
        context,
        app,
        status: "completed",
        conclusion: "success",
        output: {
            title: `Preview ${generatorEntity.displayName} Generator: (\`${groupName}\`)`,
            summary,
            text: details,
        },
    });
}

async function setRemoteAndPush(repoFullName: string, repositoryFullPath: string, app: App): Promise<string> {
    const repoMetadata = await getInstallationFromRepo(repoFullName, app);
}

async function runScriptAndCollectOutput(commands: string[], sectionTitle: string): Promise<[string, boolean]> {
    let outputs: string | undefined;
    let didFail = false;

    for (const command in commands) {
        // Write the command
        outputs += `> $ ${command}\n\n`;
        const out = await execa(command, { reject: false, all: true });
        if (out.exitCode != 0) {
            didFail = true;
        }

        if (out.all != null) {
            // Write the logs
            outputs += out.all + "\n\n";
        }
    }

    const log = `**${sectionTitle}** - ${didFail ? "❌" : "✅"}\n\n\`\`\`\n${outputs}\n\`\`\``;
    return [log, didFail];
}

async function runDefaultAction({ context, app }: { context: EmitterWebhookEvent<"check_run">; app: App }) {
    await updateCheck({
        context,
        app,
        status: "completed",
        conclusion: "neutral",
        output: {
            title: "No checks run",
            summary: "🌱 No checks were run as a result of this commit 🚫",
            text: undefined,
        },
    });
}
