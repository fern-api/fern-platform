import { S3 } from "@aws-sdk/client-s3";
import { FernRegistryClient } from "@fern-fern/generators-sdk";
import { Env } from "@libs/env";
import { setupGithubApp } from "@libs/github";
import { json2csv } from "json-2-csv";
import { App, Octokit } from "octokit";

import { Repository } from "@libs/github";

import { PullRequestState } from "@fern-fern/generators-sdk/api";
import { cleanFernStdout, execFernCli } from "@libs/fern";
import { cloneRepo, configureGit } from "@libs/github/utilities";

interface RepoData {
    id: string;
    name: string;
    full_name: string;
    default_branch: string;
    clone_url: string;
}

// In order to parallelize actioning on the data (e.g. updating openapi specs)
// we first write the data to s3 and then trigger the action from there.
export async function updateFDRRepoDataInternal(env: Env): Promise<void> {
    const app: App = setupGithubApp(env);
    const repos: RepoData[] = [];

    // Get repo data
    await app.eachRepository((installation) => {
        repos.push({
            id: installation.repository.id.toString(),
            name: installation.repository.name,
            full_name: installation.repository.full_name,
            default_branch: installation.repository.default_branch,
            clone_url: installation.repository.clone_url,
        });
    });

    // Write the data to S3
    const csvContent = json2csv(repos);
    const bucket = env.REPO_DATA_S3_BUCKET ?? "fern-bot-data";
    const key = env.REPO_DATA_S3_KEY ?? "lambdas/repos.csv";
    console.log(`Writing repo data to S3 at ${bucket}/${key}`);
    const s3 = new S3();
    await s3.putObject({
        Bucket: bucket,
        Key: key,
        Body: csvContent,
    });
}

async function updateRepoDb(
    repository: Repository,
    octokit: Octokit,
    fernBotLoginName: string,
    fernBotLoginId: string,
    fdrUrl: string,
    fernToken: string,
): Promise<void> {
    const client = new FernRegistryClient({ environment: fdrUrl, token: fernToken });

    const [git, fullRepoPath] = await configureGit(repository);
    console.log(`Cloning repo: ${repository.clone_url} to ${fullRepoPath}`);
    await cloneRepo(git, repository, octokit, fernBotLoginName, fernBotLoginId);

    let repoType: "sdk" | "config";
    let organizationId: string | undefined;
    try {
        // Try this to see if it's a fern config repo, there are probably better ways to do this
        await execFernCli(`generator list `, fullRepoPath);
        repoType = "config";
        organizationId = cleanFernStdout((await execFernCli("organization", fullRepoPath)).stdout);
    } catch (e) {
        // TODO: we should add a command to get the repos and languages for the gen.yml
        // Then run through all the repos once to get all the repos from the gen.yml
        // Then a second time to get the PRs, etc.
        //
        // Concretely have 2 jobs, one to get the repos, and one to get the PRs
        // The first only respects config repos and uses that to instantiate all the repos
        repoType = "sdk";
    }

    const repo: Record<string, unknown> = {
        type: repoType,
    };

    if (repoType === "sdk") {
        // TODO: How???
        repo.sdkLanguage = "TODO";
    }

    // Update repo in FDR
    await client.git.upsertRepository({
        ...repo,
        id: {
            type: "github",
            id: repository.id.toString(),
        },
        name: repository.name,
        owner: repository.owner.login,
        fullName: repository.full_name,
        url: repository.html_url,
        // TODO: How can we get this for SDK repos? Can we start without SDK repos?
        repositoryOwnerOrganizationId: organizationId,
        // TODO(FER-2517): actually track and action checks
        defaultBranchChecks: [],
    });
    // Get all PRs on repo, update PRs in FDR
    const pulls = await octokit.rest.pulls.list({
        state: "all",
        owner: repository.owner.login,
        repo: repository.name,
    });

    for (const pull of pulls.data) {
        try {
            await client.git.upsertPullRequest({
                pullRequestNumber: pull.number,
                repositoryName: repository.name,
                repositoryOwner: repository.owner.login,
                // TODO: This needs to be nullable, as do some of the fields (name + email)
                author: pull.user
                    ? {
                          username: pull.user.login,
                          email: pull.user.email,
                          name: pull.user.name,
                      }
                    : undefined,
                reviewers: pull.requested_reviewers?.map((reviewer) => ({})) ?? [],
                title: pull.title,
                url: pull.html_url,
                // TODO(FER-2517): actually track and action checks
                checks: [],
                // This should be a safe cast
                state: pull.state as PullRequestState,
                createdAt: new Date(pull.created_at),
                updatedAt: new Date(pull.updated_at),
                mergedAt: pull.merged_at != null ? new Date(pull.merged_at) : undefined,
                closedAt: pull.closed_at != null ? new Date(pull.closed_at) : undefined,
            });
        } catch (e) {
            console.error(
                `Error updating PR ${pull.number} on repo ${repository.full_name}: ${e}, likely we have not registered this repo, quitting.`,
            );
            return;
        }
    }
}
