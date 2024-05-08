import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { components } from "@octokit/openapi-types";
import { mkdir } from "fs/promises";
import { Octokit } from "octokit";
import * as path from "path";
import simpleGit from "simple-git";
import tmp from "tmp-promise";

interface CreatePRRequest {
    title: string;
    body: string;
    base: string;
    draft?: boolean;
}

interface RepoMetadata {
    owner: string;
    repo: string;
}

export async function createOrUpdatePullRequest(
    octokit: Octokit,
    inputs: CreatePRRequest,
    baseRepository: string,
    headRepository: string,
    branchName: string,
): Promise<void> {
    const [headOwner] = headRepository.split("/");
    const headBranch = `${headOwner}:${branchName}`;

    // Try to create the pull request
    try {
        console.log("Attempting creation of pull request");
        const { data: pull } = await octokit.rest.pulls.create({
            ...parseRepository(baseRepository),
            title: inputs.title,
            head: headBranch,
            head_repo: headRepository,
            base: inputs.base,
            body: inputs.body,
            draft: inputs.draft,
        });
        console.log(
            `Created pull request #${pull.number} (${headBranch} => ${inputs.base}), with info ${JSON.stringify({
                number: pull.number,
                html_url: pull.html_url,
                created: true,
            })}`,
        );
    } catch (e) {
        if (getErrorMessage(e).includes("A pull request already exists for")) {
            console.error(`A pull request already exists for ${headBranch}`);
        } else {
            throw e;
        }
    }

    // Update the pull request that exists for this branch and base
    console.log("Fetching existing pull request");
    const { data: pulls } = await octokit.rest.pulls.list({
        ...parseRepository(baseRepository),
        state: "open",
        head: headBranch,
        base: inputs.base,
    });
    console.log("Attempting update of pull request");
    const { data: pull } = await octokit.rest.pulls.update({
        ...parseRepository(baseRepository),
        pull_number: pulls[0].number,
        title: inputs.title,
        body: inputs.body,
    });
    console.log(
        `Updated pull request #${pull.number} (${headBranch} => ${inputs.base}) with information ${JSON.stringify({
            number: pull.number,
            html_url: pull.html_url,
            created: false,
        })}`,
    );
}

function parseRepository(repository: string): RepoMetadata {
    const [owner, repo] = repository.split("/");
    return {
        owner,
        repo,
    };
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

export const DEFAULT_REMOTE_NAME = "origin";
export type Repository = components["schemas"]["repository"];

export async function configureGit(repository: Repository): Promise<[any, string]> {
    const tmpDir = await tmp.dir();
    const fullRepoPath = AbsoluteFilePath.of(path.join(tmpDir.path, repository.id.toString(), repository.name));
    if (!(await doesPathExist(fullRepoPath))) {
        await mkdir(fullRepoPath, { recursive: true });
    }
    return [simpleGit(fullRepoPath), fullRepoPath];
}

export async function cloneRepo(
    git: any,
    repository: Repository,
    octokit: Octokit,
    fernBotLoginName: string,
    fernBotLoginId: string,
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const installationToken = ((await octokit.auth({ type: "installation" })) as any).token;

    const authedCloneUrl = repository.clone_url.replace("https://", `https://x-access-token:${installationToken}@`);
    // Clone the repo to fullRepoPath and update the branch
    await git.clone(authedCloneUrl, ".");
    // Configure git to show the app as the committer
    await git.addConfig("user.name", fernBotLoginName);
    await git.addConfig("user.email", `${fernBotLoginId}+${fernBotLoginName}@users.noreply.github.com`);
}

export async function getOrUpdateBranch(git: any, defaultBranchName: string, branchToCheckoutName: string) {
    try {
        // If you can fetch the branch, checkout the branch
        await git.fetch(DEFAULT_REMOTE_NAME, branchToCheckoutName);
        console.log("Branch exists, checking out");
        await git.checkout(branchToCheckoutName);
        // Merge the default branch into this branch to update it
        // prefer the default branch changes
        //
        // TODO: we could honestly probably just delete the branch and recreate it
        // my concern with that is if there are more changes we decide to make in other actions
        // to the same branch that are not OpenAPI related, that we'd lose if we deleted and reupdated the spec.
        await git.merge(["-X", "theirs", defaultBranchName]);
    } catch (e) {
        console.log("Branch does not exist, create and checkout");
        await git.checkoutBranch(branchToCheckoutName, defaultBranchName);
    }
}
