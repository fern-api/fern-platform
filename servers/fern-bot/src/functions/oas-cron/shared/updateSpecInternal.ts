import { createOrUpdatePullRequest, getOrUpdateBranch } from "@fern-platform/github";
import { generateChangelog, generateCommitMessage } from "@libs/cohere";
import { execFernCli } from "@libs/fern";
import { DEFAULT_REMOTE_NAME, Repository, cloneRepo, configureGit } from "@libs/github";
import { Octokit } from "octokit";

const OPENAPI_UPDATE_BRANCH = "fern/update-api-specs";

export async function updateSpecInternal(
    octokit: Octokit,
    repository: Repository,
    fernBotLoginName: string,
    fernBotLoginId: string,
): Promise<void> {
    const [git, fullRepoPath] = await configureGit(repository);
    const originDefaultBranch = `${DEFAULT_REMOTE_NAME}/${repository.default_branch}`;

    console.log(`Cloning repo: ${repository.clone_url} to ${fullRepoPath}`);
    await cloneRepo(git, repository, octokit, fernBotLoginName, fernBotLoginId);
    await getOrUpdateBranch(git, originDefaultBranch, OPENAPI_UPDATE_BRANCH);

    // Run API update command which will pull the new spec from the specified
    // origin and write it to disk we can then commit it to github from there.
    await execFernCli("api update", fullRepoPath);

    console.log("Checking for changes to commit and push");
    if (!(await git.status()).isClean()) {
        console.log("Changes detected, committing and pushing");
        // Add + commit files
        const commitDiff = await git.diff();
        await git.add(["-A"]);
        await git.commit(await generateCommitMessage(commitDiff));

        // Push the changes
        await git.push([
            "--force-with-lease",
            DEFAULT_REMOTE_NAME,
            `${OPENAPI_UPDATE_BRANCH}:refs/heads/${OPENAPI_UPDATE_BRANCH}`,
        ]);

        const fullDiff = await git.diff([originDefaultBranch]);
        // Open a PR
        await createOrUpdatePullRequest(
            octokit,
            {
                title: ":herb: :sparkles: [Scheduled] Update API Spec",
                base: "main",
                body: await generateChangelog(fullDiff),
            },
            repository.full_name,
            repository.full_name,
            OPENAPI_UPDATE_BRANCH,
        );
    } else {
        console.log("No changes detected, skipping PR creation");
    }
}
