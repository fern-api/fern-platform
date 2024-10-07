import { EmitterWebhookEvent } from "@octokit/webhooks";
import { getGenerators, getOrganzation, isOrganizationCanary, NO_API_FALLBACK_KEY } from "@libs/fern";
import { App } from "octokit";
import { stringifyRunId } from "./utilities";
import { cloneRepo, configureGit } from "@libs/github";
import { FernRegistryClient } from "@fern-fern/paged-generators-sdk";

export async function initiatePreviewRuns({
    context,
    githubApp,
    fernBotLoginName,
    fernBotLoginId,
    venusUrl,
    fdrUrl,
}: {
    context: EmitterWebhookEvent<"check_suite">;
    githubApp: App;
    fernBotLoginName: string;
    fernBotLoginId: string;
    venusUrl: string;
    fdrUrl: string;
}): Promise<void> {
    if (context.payload.installation == null) {
        // If there's no installation ID, do not kick off any checks
        console.log("No installation ID was found, skipping check run creation.");
        return;
    }

    // Get the repo, and make sure it's a fern config repo
    const octokit = await githubApp.getInstallationOctokit(context.payload.installation.id);
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

    const generatorsList = await getGenerators(fullRepoPath, "--exclude-mode local");
    for (const [apiName, api] of Object.entries(generatorsList)) {
        for (const [groupName, group] of Object.entries(api)) {
            for (const generator of group) {
                let checkApiName: string | undefined;
                if (apiName !== NO_API_FALLBACK_KEY) {
                    checkApiName = apiName;
                }
                githubApp.log.info(
                    `Kicking off SDK preview check for ${context.payload.repository.owner.login}/${context.payload.repository.name}`,
                );

                const fdrClient = new FernRegistryClient({ environment: fdrUrl });
                const generatorEntity = await fdrClient.generators.getGeneratorByImage({
                    dockerImage: generator,
                });

                if (generatorEntity != null) {
                    await octokit.rest.checks.create({
                        owner: context.payload.repository.owner.login,
                        repo: context.payload.repository.name,
                        name: `🌿 SDK Preview / Preview ${generatorEntity.displayName} Generator: (\`${groupName}\`)`,
                        head_sha: context.payload.check_suite.head_sha,
                        external_id: stringifyRunId({
                            action: "sdk_preview",
                            generatorDockerImage: generator,
                            groupName,
                            apiName: checkApiName,
                        }),
                    });
                }
            }
        }
    }
}
