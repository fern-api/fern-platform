import { components } from "@octokit/openapi-types";
import { App, Octokit } from "octokit";

import { Env } from "@libs/env";
import { createWriteStream } from "fs";
import * as path from "path";
import simpleGit from "simple-git";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { API_ORIGIN_LOCATION_KEY, ASYNC_API_LOCATION_KEY, OPENAPI_LOCATION_KEY } from "../fern-cli/schemas";
import { loadRawGeneratorsConfiguration } from "../fern-cli/utilities";
import { setupGithubApp } from "../github/octokit";
import { createOrUpdatePullRequest } from "../github/utilities";

const OPENAPI_UPDATE_BRANCH = "fern/update-api-specs";
type Repository = components["schemas"]["repository"];

async function fetchAndWriteFile(url: string, path: string): Promise<void> {
    console.log("Spec origin found, pulling spec from origin");
    const resp = await fetch(url);
    if (resp.ok && resp.body) {
        const fileStream = createWriteStream(path);
        await finished(Readable.fromWeb(resp.body).pipe(fileStream));
    }
}

async function updateOpenApiSpecInternal(octokit: Octokit, repository: Repository): Promise<void> {
    const repoDir = `${__dirname}/${repository.id}`;
    const fullRepoPath = path.join(repoDir, repository.name);

    const branchRemoteName = "origin";

    console.log(`Cloning repo: ${repository.clone_url} to ${fullRepoPath}`);
    const git = simpleGit(fullRepoPath);
    // Clone the repo to repoDir and update the branch
    await git.clone(repository.clone_url);
    if (!(await git.fetch(branchRemoteName, OPENAPI_UPDATE_BRANCH))) {
        await git.checkoutBranch(OPENAPI_UPDATE_BRANCH, branchRemoteName);
        await git.merge(["-X", "theirs", `${branchRemoteName}/${repository.default_branch}`]);
    } else {
        await git.checkout(OPENAPI_UPDATE_BRANCH);
    }

    // Parse the generators config
    console.log("Loading generator configuration");
    const generatorConfig = await loadRawGeneratorsConfiguration(fullRepoPath);
    if (generatorConfig == null) {
        console.error(`Could not find generators config within repo: ${fullRepoPath}`);
        return;
    }

    // Fetch and update the API spec
    let origin;
    if (generatorConfig.api != null) {
        if (generatorConfig.api instanceof Array) {
            for (const api of generatorConfig.api) {
                if (typeof api !== "string" && api.origin != null) {
                    await fetchAndWriteFile(api.path, api.origin);
                }
            }
        }
    } else if (generatorConfig[ASYNC_API_LOCATION_KEY] != null) {
        if (generatorConfig[API_ORIGIN_LOCATION_KEY] != null) {
            await fetchAndWriteFile(generatorConfig[API_ORIGIN_LOCATION_KEY], generatorConfig[ASYNC_API_LOCATION_KEY]);
        }
    } else if (generatorConfig[OPENAPI_LOCATION_KEY] != null) {
        const apiOrigin =
            typeof generatorConfig[OPENAPI_LOCATION_KEY] !== "string"
                ? generatorConfig[OPENAPI_LOCATION_KEY].origin ?? generatorConfig[API_ORIGIN_LOCATION_KEY]
                : generatorConfig[API_ORIGIN_LOCATION_KEY];

        const apiOutput =
            typeof generatorConfig[OPENAPI_LOCATION_KEY] !== "string"
                ? generatorConfig[OPENAPI_LOCATION_KEY].path
                : generatorConfig[OPENAPI_LOCATION_KEY];
        if (apiOrigin != null) {
            await fetchAndWriteFile(apiOrigin, apiOutput);
        }
    }

    console.log("Checking for changes to commit and push");
    if (origin != undefined && !(await git.status()).isClean()) {
        // Add + commit files
        await git.add(["-A"]);
        await git.commit(":herb: Update API Spec");

        // Push the changes
        await git.push([
            "--force-with-lease",
            branchRemoteName,
            `${OPENAPI_UPDATE_BRANCH}:refs/heads/${OPENAPI_UPDATE_BRANCH}`,
        ]);

        // Open a PR
        await createOrUpdatePullRequest(
            octokit,
            {
                title: ":herb: [Scheduled] Update API Spec",
                base: "main",
                body: `This PR updates the API spec from the specified origin at: ${origin}`,
            },
            repository.full_name,
            repository.full_name,
            OPENAPI_UPDATE_BRANCH,
        );
    }
}

export async function updateOpenApiSpecsInternal(env: Env): Promise<void> {
    const app: App = setupGithubApp(env);

    await app.eachRepository(async (installation) => {
        console.log("Encountered installation", installation.repository.full_name);
        await updateOpenApiSpecInternal(installation.octokit, installation.repository);
    });
}
