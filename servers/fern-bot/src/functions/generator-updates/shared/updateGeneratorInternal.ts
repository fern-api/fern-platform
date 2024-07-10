import { createOrUpdatePullRequest, getOrUpdateBranch } from "@fern-api/github";
import { execFernCli } from "@libs/fern";
import { DEFAULT_REMOTE_NAME, cloneRepo, configureGit, type Repository } from "@libs/github/utilities";
import { Octokit } from "octokit";

const GENERATOR_UPDATE_BRANCH = "fern/update-generators";

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
        // Run fern CLI upgrade as well as generator upgrade which will go through each group in gen.yml
        // and upgrade the generator version to the latest, non-RC version tagged in DockerHub.
        await execFernCli("upgrade", fullRepoPath);
        await execFernCli("generator upgrade", fullRepoPath);
    } catch (error) {
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
