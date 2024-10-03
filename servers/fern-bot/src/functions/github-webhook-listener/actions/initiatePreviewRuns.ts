import { EmitterWebhookEvent } from "@octokit/webhooks";
import { execFernCli, getGenerators, getOrganzation, isOrganizationCanary, NO_API_FALLBACK_KEY } from "@libs/fern";
import { App } from "octokit";
import tmp from "tmp-promise";
import { stringifyRunId } from "./utilities";
import { cloneRepo, configureGit } from "@libs/github";
import { readFile } from "fs/promises";

export async function initiatePreviewRuns({
    context,
    app,
    fernBotLoginName,
    fernBotLoginId,
    venusUrl,
}: {
    context: EmitterWebhookEvent<"check_suite">;
    app: App;
    fernBotLoginName: string;
    fernBotLoginId: string;
    venusUrl: string;
}): Promise<void> {
    if (context.payload.installation == null) {
        // If there's no installation ID, do not kick off any checks
        console.log();
        return;
    }
    // Get the repo, and make sure it's a fern config repo
    const octokit = await app.getInstallationOctokit(context.payload.installation.id);
    const repository = context.payload.repository;
    const [git, fullRepoPath] = await configureGit(repository);
    await cloneRepo(git, repository, octokit, fernBotLoginName, fernBotLoginId);

    // Don't kick anything off unless it's a fern bot canary
    try {
        const maybeOrganization = await getOrganzation(fullRepoPath);
        if (maybeOrganization == null) {
            throw new Error("No organization was found, quitting before generator upgrades.");
        } else if (!(await isOrganizationCanary(maybeOrganization, venusUrl))) {
            console.log("Organization is not a fern-bot canary, skipping upgrade.");
            return;
        }
    } catch (error) {
        console.error("Could not determine if the repo owner was a fern-bot canary, quitting.");
        throw error;
    }

    const generatorsList = await getGenerators(fullRepoPath);
    for (const [apiName, api] of Object.entries(generatorsList)) {
        for (const [groupName, group] of Object.entries(api)) {
            for (const generator of group) {
                let checkApiName: string | undefined;
                if (apiName !== NO_API_FALLBACK_KEY) {
                    checkApiName = apiName;
                }

                const tmpDir = await tmp.dir();
                const repoJsonFileName = `${tmpDir.path}/${repository.id.toString()}.json`;
                let getRepoCommand = `generator get --repository --generator ${generator} --group ${groupName} -o ${repoJsonFileName}`;
                if (apiName !== NO_API_FALLBACK_KEY) {
                    getRepoCommand += ` --api ${apiName}`;
                }
                await execFernCli(getRepoCommand, fullRepoPath);
                const maybeRepo = await readFile(repoJsonFileName, "utf8");
                let maybeGithubRepositoryFullName: string | undefined;
                if (maybeRepo?.length > 0) {
                    // Of the form { repository: string, language: string }
                    const generatorsYmlRepo = JSON.parse(maybeRepo);
                    if ("repository" in generatorsYmlRepo && generatorsYmlRepo.repository.length > 0) {
                        maybeGithubRepositoryFullName = generatorsYmlRepo.repository;
                    }
                }

                await app.octokit.rest.checks.create({
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    owner: context.payload.repository.owner.name!,
                    repo: context.payload.repository.name,
                    name: "🌿 SDK Preview",
                    head_sha: context.payload.check_suite.head_sha,
                    external_id: stringifyRunId({
                        action: "sdk_preview",
                        githubRepositoryFullName: maybeGithubRepositoryFullName,
                        generatorDockerImage: generator,
                        groupName,
                        apiName: checkApiName,
                    }),
                });
            }
        }
    }
}
