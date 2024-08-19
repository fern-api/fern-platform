import { createOrUpdatePullRequest, getOrUpdateBranch } from "@fern-api/github";
import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { execFernCli } from "@libs/fern";
import { DEFAULT_REMOTE_NAME, cloneRepo, configureGit, type Repository } from "@libs/github/utilities";
import { Octokit } from "octokit";

import fs from "fs/promises";
import path from "path";

const GENERATOR_UPDATE_BRANCH = "fern/update-generators";

// ==========================================================================================================
// HACK: Tempoary solution for getting the organization feature flag to enable this feature
// This should in theory live in the CLI, but we might not want to expose the auth needs there.
// It's also nice that it's here so that we're not tied to a specific version of the CLI gating this feature
// and can be updated independently, since we know we want to remove this check in the near future.
async function searchFile(directory: string, fileName: string): Promise<string | null> {
    const files = await fs.readdir(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);

        if (stats.isDirectory()) {
            const result = searchFile(filePath, fileName);
            if (result) {
                return result;
            }
        } else if (file === fileName) {
            return filePath;
        }
    }

    return null;
}
async function getOrganization(basePath: string): Promise<string> {
    const fernConfigPath = await searchFile(basePath, "fern.config.json");
    if (!fernConfigPath) {
        throw new Error("Could not find fern.config.json");
    }

    const fernConfigFile = await fs.readFile(fernConfigPath, "utf8");
    const fernConfig = JSON.parse(fernConfigFile);

    return fernConfig.organization;
}
async function isOrganizationCanary(basePath: string): Promise<boolean> {
    const orgId = await getOrganization(basePath);
    const client = new FernVenusApiClient({
        environment: process.env.DEFAULT_VENUS_ORIGIN ?? "https://venus.buildwithfern.com", // TODO: Make this an envvar too
    });

    const response = await client.organization.get(FernVenusApi.OrganizationId(orgId));
    if (!response.ok) {
        throw new Error(`Organization ${orgId} not found`);
    }

    return response.body.isFernbotCanary;
}
// ==========================================================================================================

export async function updateVersionInternal(
    octokit: Octokit,
    repository: Repository,
    fernBotLoginName: string,
    fernBotLoginId: string,
): Promise<void> {
    const [git, fullRepoPath] = await configureGit(repository);
    console.log(`Cloning repo: ${repository.clone_url} to ${fullRepoPath}`);
    await cloneRepo(git, repository, octokit, fernBotLoginName, fernBotLoginId);

    const originDefaultBranch = `${DEFAULT_REMOTE_NAME}/${repository.default_branch}`;
    await getOrUpdateBranch(git, originDefaultBranch, GENERATOR_UPDATE_BRANCH);

    try {
        if (!(await isOrganizationCanary(fullRepoPath))) {
            console.log("Organization is not a fern-bot canary, skipping upgrade.");
            return;
        }
        // Run fern CLI upgrade as well as generator upgrade which will go through each group in gen.yml
        // and upgrade the generator version to the latest, non-RC version tagged in DockerHub.
        await execFernCli("upgrade", fullRepoPath);
        await execFernCli("generator upgrade", fullRepoPath);
    } catch (error) {
        console.error("Error running fern CLI upgrade:", error);
        return;
    }

    console.log("Checking for changes to commit and push");
    if (!(await git.status()).isClean()) {
        console.log("Changes detected, committing and pushing");
        // Add + commit files
        await git.add(["-A"]);
        await git.commit("(chore): upgrade generator versions to latest");

        // Push the changes
        await git.push([
            "--force-with-lease",
            DEFAULT_REMOTE_NAME,
            `${GENERATOR_UPDATE_BRANCH}:refs/heads/${GENERATOR_UPDATE_BRANCH}`,
        ]);

        // Open a PR
        await createOrUpdatePullRequest(
            octokit,
            {
                title: ":herb: :sparkles: [Scheduled] Upgrade SDK Generator Versions",
                base: "main",
                // TODO: This should really pull from the changelogs the generators maintain in the Fern repo
                // at the least the CLI should output the versions of the generators it's upgrading, so we can display that
                body: `## Automated Upgrade PR
<br/>
---
This pull-request upgrades the Fern CLI and the generators that you subscribe to. To understand 
what's changed, read our changelogs [here](https://github.com/fern-api/fern?tab=readme-ov-file#-generators).`,
            },
            repository.full_name,
            repository.full_name,
            GENERATOR_UPDATE_BRANCH,
        );
    } else {
        console.log("No changes detected, skipping PR creation");
    }
}
