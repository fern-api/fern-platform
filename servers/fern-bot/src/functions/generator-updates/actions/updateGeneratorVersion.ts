import { execFernCli } from "@libs/fern";
import {
    DEFAULT_REMOTE_NAME,
    cloneRepo,
    configureGit,
    createOrUpdatePullRequest,
    getOrUpdateBranch,
    type Repository,
} from "@libs/github/utilities";
import { Octokit } from "octokit";

const GENERATOR_UPDATE_BRANCH = "fern/update-generators";

export async function updateGeneratorVersionInternal(
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
        // Run API update command which will pull the new spec from the specified
        // origin and write it to disk we can then commit it to github from there.
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
This Pull Request has been auto-generated as part of Fern's release process.`,
            },
            repository.full_name,
            repository.full_name,
            GENERATOR_UPDATE_BRANCH,
        );
    }
}
