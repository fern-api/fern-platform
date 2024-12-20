import { FernRegistryClient } from "@fern-fern/generators-sdk";
import {
  PullRequestReviewer,
  PullRequestState,
} from "@fern-fern/generators-sdk/api";
import { Env } from "@libs/env";
import {
  NO_API_FALLBACK_KEY,
  cleanFernStdout,
  execFernCli,
  findFernWorkspaces,
  getGenerators,
} from "@libs/fern";
import { PullRequest, Repository, setupGithubApp } from "@libs/github";
import { cloneRepo, configureGit } from "@libs/github/utilities";
import { RepoData } from "@libs/schemas";
import { readFile } from "fs/promises";
import { App, Octokit } from "octokit";
import tmp from "tmp-promise";

// Note given we're making requests to FDR, this could take time, so we're parallelizing this function with a Map step in
// the step function, as we do for all the other actions.
export async function updateFDRRepoDataInternal(
  env: Env,
  repoData: RepoData | undefined
): Promise<void> {
  const app: App = setupGithubApp(env);

  // Get repo data for the given repo
  await app.eachRepository(async (installation) => {
    if (repoData && installation.repository.full_name !== repoData.full_name) {
      return;
    }
    await updateRepoDb(
      app,
      installation.repository,
      installation.octokit,
      env.GITHUB_APP_LOGIN_NAME,
      env.GITHUB_APP_LOGIN_ID,
      env.DEFAULT_FDR_ORIGIN,
      env.FERN_TOKEN
    );
  });
}

async function updateRepoDb(
  app: App,
  repository: Repository,
  octokit: Octokit,
  fernBotLoginName: string,
  fernBotLoginId: string,
  fdrUrl: string,
  fernToken: string
): Promise<void> {
  console.log(`Updating repo data at  ${fdrUrl} with token ${fernToken}`);
  const client = new FernRegistryClient({
    environment: fdrUrl,
    token: fernToken,
  });

  const [git, fullRepoPath] = await configureGit(repository);
  console.log(`Cloning repo: ${repository.clone_url} to ${fullRepoPath}`);
  await cloneRepo(git, repository, octokit, fernBotLoginName, fernBotLoginId);

  const fernWorkspaces = await findFernWorkspaces(fullRepoPath);
  for (const fernWorkspacePath of fernWorkspaces) {
    try {
      // Try this to see if it's a fern config repo, there are probably better ways to do this
      const generatorsList = await getGenerators(fernWorkspacePath);
      const result = await execFernCli("organization", fernWorkspacePath);
      const organizationId = cleanFernStdout(
        typeof result.stdout === "string" ? result.stdout : ""
      );

      // Update config repo in FDR
      const upsertResponse = await client.git.upsertRepository({
        type: "config",
        id: {
          type: "github",
          id: repository.id.toString(),
        },
        name: repository.name,
        owner: repository.owner.login,
        fullName: repository.full_name,
        url: repository.html_url,
        repositoryOwnerOrganizationId: organizationId,
        // TODO(FER-2517): actually track and action checks
        defaultBranchChecks: [],
      });

      if (!upsertResponse.ok) {
        console.log(
          `Failed to upsert configuration repo, bailing out: ${JSON.stringify(upsertResponse.error)}`
        );
        return;
      }
      await getAndUpsertPulls(client, octokit, repository);

      for (const [apiName, api] of Object.entries(generatorsList)) {
        for (const [groupName, group] of Object.entries(api)) {
          for (const generator of group) {
            const tmpDir = await tmp.dir();
            const repoJsonFileName = `${tmpDir.path}/${repository.id.toString()}.json`;
            let command = `generator get --repository --language --generator ${generator} --group ${groupName} -o ${repoJsonFileName}`;
            if (apiName !== NO_API_FALLBACK_KEY) {
              command += ` --api ${apiName}`;
            }

            await execFernCli(command, fernWorkspacePath);
            const maybeRepo = await readFile(repoJsonFileName, "utf8");
            if (maybeRepo?.length > 0) {
              // Of the form { repository: string, language: string }
              const generatorsYmlRepo = JSON.parse(maybeRepo);
              if (
                "repository" in generatorsYmlRepo &&
                generatorsYmlRepo.repository.length > 0
              ) {
                const octokitRepo = await getRepository(
                  app,
                  generatorsYmlRepo.repository
                );
                if (octokitRepo) {
                  await client.git.upsertRepository({
                    type: "sdk",
                    sdkLanguage: generatorsYmlRepo.language,
                    id: {
                      type: "github",
                      id: octokitRepo.id.toString(),
                    },
                    name: octokitRepo.name,
                    owner: octokitRepo.owner.login,
                    fullName: octokitRepo.full_name,
                    url: octokitRepo.url,
                    repositoryOwnerOrganizationId: organizationId,
                    // TODO(FER-2517): actually track and action checks
                    defaultBranchChecks: [],
                  });

                  await getAndUpsertPulls(client, octokit, octokitRepo);
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.log(
        `Found a repo that was not a Fern config repo, or not a high enough version, skipping...: ${(e as Error).message}`
      );
    }
  }
}

async function getAndUpsertPulls(
  client: FernRegistryClient,
  octokit: Octokit,
  repository: Repository
) {
  // Get all PRs on repo, update PRs in FDR
  const pulls = await octokit.paginate(octokit.rest.pulls.list, {
    state: "all",
    owner: repository.owner.login,
    repo: repository.name,
  });

  for (const pull of pulls) {
    try {
      await client.git.upsertPullRequest({
        pullRequestNumber: pull.number,
        repositoryName: repository.name,
        repositoryOwner: repository.owner.login,
        author: pull.user
          ? {
              username: pull.user.login,
              // These can be null or undefined, but we're just taking them as the same and making them undefined
              email: pull.user.email ?? undefined,
              name: pull.user.name ?? undefined,
            }
          : undefined,
        reviewers: getReviewers(pull as PullRequest),
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
        `Error updating PR ${pull.number} on repo ${repository.full_name}: ${e}, likely we have not registered this repo, quitting.`
      );
      return;
    }
  }
}

function getReviewers(pull: PullRequest): PullRequestReviewer[] {
  const reviewers: PullRequestReviewer[] = [];
  if (pull.requested_reviewers != null) {
    for (const reviewer of pull.requested_reviewers) {
      reviewers.push({
        type: "user",
        username: reviewer.login,
        // These can be null or undefined, but we're just taking them as the same and making them undefined
        email: reviewer.email ?? undefined,
        name: reviewer.name ?? undefined,
      });
    }
  }

  if (pull.requested_teams != null) {
    for (const team_reviewer of pull.requested_teams) {
      reviewers.push({
        type: "team",
        name: team_reviewer.name,
        teamId: team_reviewer.id.toString(),
      });
    }
  }

  return reviewers;
}

// Does octokit not expose a better way to do this???
async function getRepository(
  app: App,
  repositoryFullName: string
): Promise<Repository | undefined> {
  let maybeRepo: Repository | undefined = undefined;
  await app.eachRepository((installation) => {
    // repo and organization names are case insensitive, so the full name is as well
    if (
      installation.repository.full_name.toLowerCase() ===
      repositoryFullName.toLowerCase()
    ) {
      maybeRepo = installation.repository;
    }
  });

  return maybeRepo;
}
