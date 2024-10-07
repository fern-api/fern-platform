import { doesPathExist } from "@libs/fs";
import { components } from "@octokit/openapi-types";
import { Repository as WebhooksRepository } from "@octokit/webhooks-types";
import { mkdir } from "fs/promises";
import { Octokit } from "octokit";
import * as path from "path";
import simpleGit, { SimpleGit } from "simple-git";
import tmp from "tmp-promise";

export const DEFAULT_REMOTE_NAME = "origin";
export type Repository = components["schemas"]["repository"] | WebhooksRepository;
export type PullRequest = components["schemas"]["pull-request"];

export async function configureGit(repository: Repository): Promise<[SimpleGit, string]> {
    const tmpDir = await tmp.dir();
    const fullRepoPath = path.join(tmpDir.path, repository.id.toString(), repository.name);
    if (!(await doesPathExist(fullRepoPath))) {
        await mkdir(fullRepoPath, { recursive: true });
    }
    return [simpleGit(fullRepoPath), fullRepoPath];
}

export async function cloneRepo(
    git: SimpleGit,
    repository: Repository,
    octokit: Octokit,
    fernBotLoginName: string,
    fernBotLoginId: string,
): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const installationToken = ((await octokit.auth({ type: "installation" })) as any).token;

    const authedCloneUrl = repository.clone_url.replace("https://", `https://x-access-token:${installationToken}@`);
    // Clone the repo to fullRepoPath and update the branch
    await git.clone(authedCloneUrl, ".");
    // Configure git to show the app as the committer
    await git.addConfig("user.name", fernBotLoginName);
    await git.addConfig("user.email", `${fernBotLoginId}+${fernBotLoginName}@users.noreply.github.com`);
}
