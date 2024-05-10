import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { generateChangelog, generateCommitMessage } from "@libs/cohere";
import { Env } from "@libs/env";
import { components } from "@octokit/openapi-types";
import { mkdir } from "fs/promises";
import { App, Octokit } from "octokit";
import * as path from "path";
import simpleGit from "simple-git";
import tmp from "tmp-promise";
import { execFernCli } from "../../../libs/fern";
import { setupGithubApp } from "../github/octokit";
import { createOrUpdatePullRequest } from "../github/utilities";

const OPENAPI_UPDATE_BRANCH = "fern/update-api-specs";
type Repository = components["schemas"]["repository"];

async function updateOpenApiSpecInternal(
    octokit: Octokit,
    repository: Repository,
    fernBotLoginName: string,
    fernBotLoginId: string,
): Promise<void> {
    const tmpDir = await tmp.dir();
    const fullRepoPath = AbsoluteFilePath.of(path.join(tmpDir.path, repository.id.toString(), repository.name));

    const branchRemoteName = "origin";
    const originDefaultBranch = `${branchRemoteName}/${repository.default_branch}`;

    console.log(`Cloning repo: ${repository.clone_url} to ${fullRepoPath}`);
    if (!(await doesPathExist(fullRepoPath))) {
        await mkdir(fullRepoPath, { recursive: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const installationToken = ((await octokit.auth({ type: "installation" })) as any).token;
    const git = simpleGit(fullRepoPath);

    const authedCloneUrl = repository.clone_url.replace("https://", `https://x-access-token:${installationToken}@`);
    // Clone the repo to fullRepoPath and update the branch
    await git.clone(authedCloneUrl, ".");
    // Configure git to show the app as the committer
    await git.addConfig("user.name", fernBotLoginName);
    await git.addConfig("user.email", `${fernBotLoginId}+${fernBotLoginName}@users.noreply.github.com`);
    try {
        // If you can fetch the branch, checkout the branch
        await git.fetch(branchRemoteName, OPENAPI_UPDATE_BRANCH);
        console.log("Branch exists, checking out");
        await git.checkout(OPENAPI_UPDATE_BRANCH);
        // Merge the default branch into this branch to update it
        // prefer the default branch changes
        //
        // TODO: we could honestly probably just delete the branch and recreate it
        // my concern with that is if there are more changes we decide to make in other actions
        // to the same branch that are not OpenAPI related, that we'd lose if we deleted and reupdated the spec.
        await git.merge(["-X", "theirs", originDefaultBranch]);
    } catch (e) {
        console.log("Branch does not exist, create and checkout");
        await git.checkoutBranch(OPENAPI_UPDATE_BRANCH, branchRemoteName);
    }

    try {
        // Run API update command which will pull the new spec from the specified
        // origin and write it to disk we can then commit it to github from there.
        await execFernCli("api update", fullRepoPath);
    } catch (error) {
        return;
    }

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
            branchRemoteName,
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
    }
}

export async function updateOpenApiSpecsInternal(env: Env): Promise<void> {
    const app: App = setupGithubApp(env);

    if (env.REPO_TO_RUN_ON !== undefined) {
        console.log("REPO_TO_RUN_ON has been specified, only running on:", env.REPO_TO_RUN_ON);
    }
    await app.eachRepository(async (installation) => {
        if (env.REPO_TO_RUN_ON !== undefined && installation.repository.full_name !== env.REPO_TO_RUN_ON) {
            return;
        } else if (env.REPO_TO_RUN_ON !== undefined) {
            console.log("REPO_TO_RUN_ON has been found, running logic.");
        }
        console.log("Encountered installation", installation.repository.full_name);
        await updateOpenApiSpecInternal(
            installation.octokit,
            installation.repository,
            env.GITHUB_APP_LOGIN_NAME,
            env.GITHUB_APP_LOGIN_ID,
        );
    });
}
