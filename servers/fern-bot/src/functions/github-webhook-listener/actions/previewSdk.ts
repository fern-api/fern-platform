import { FernRegistryClient } from "@fern-fern/paged-generators-sdk";
import { execFernCli } from "@libs/fern";
import { cloneRepo, configureGit } from "@libs/github";
import { EmitterWebhookEvent } from "@octokit/webhooks";
import execa from "execa";
import { App } from "octokit";
import { markCheckInProgress, updateCheck, RunId } from "./utilities";

// We want to:
//  1. Update the status to in_progress
//  2. Pull the config repo
//  3. Run `fern generate --preview --group ${} --generator ${} --api ${}`
//  4. Kick off the checks (from generator CRUD API)
//  5. If there's a repo, push a branch to that repo
//  6. Complete the action with the checks status
//    6a. Include detailed logs in the `output` block
export async function previewSdk({
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
}): Promise<void> {
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
    const { generatorDockerImage, groupName, apiName } = runId;
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
    // ====== ACTION COMPLETE ======

    // Tell github we're done and deliver the deets
    const summary = `### 🌱 ${generatorEntity.generatorLanguage ?? "SDK"} Preview Checks - ${failedTasks}/${totalTasks} ${failedTasks > 0 ? "❌" : "✅"}\n\n`;
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

export async function runDefaultAction({
    context,
    app,
}: {
    context: EmitterWebhookEvent<"check_run">;
    app: App;
}): Promise<void> {
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
