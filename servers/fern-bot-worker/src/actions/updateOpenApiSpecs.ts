import { components } from "@octokit/openapi-types";
import { App, Octokit } from "octokit";

import path from "node:path";
import { Readable } from "node:stream";
// import { finished } from "node:stream/promises";
import { Env } from "../env";
import { API_ORIGIN_LOCATION_KEY, ASYNC_API_LOCATION_KEY, OPENAPI_LOCATION_KEY } from "../fern-cli/schemas";
import { loadRawGeneratorsConfiguration } from "../fern-cli/utilities";
import { GitCommander } from "../github/GitCommander";
import { setupGithubApp } from "../github/octokit";
import { createOrUpdatePullRequest } from "../github/utilities";

const OPENAPI_UPDATE_BRANCH = "fern/update-api-specs";
type Repository = components["schemas"]["repository"];

async function fetchAndWriteFile(url: string, path: string): Promise<void> {
    const resp = await fetch(url);
    if (resp.ok && resp.body) {
        const fileStream = require("fs").createWriteStream(path);
        await require("node:stream/promises").finished(Readable.fromWeb(resp.body).pipe(fileStream));
    }
}

async function updateOpenApiSpec(octokit: Octokit, repository: Repository): Promise<void> {
    const repoDir = `${__dirname}/${repository.id}`;
    const fullRepoPath = path.join(repoDir, repository.name);

    const branchRemoteName = "origin";

    // Auth the app with the repo
    // TODO: figure out if this octokit instance has the right auth.
    let ghAuth = repository.temp_clone_token;
    if (ghAuth == null) {
        // @ts-expect-error: Octokit auth is not typed correctly
        const { token, tokenType } = await octokit.auth();
        const tokenWithPrefix = tokenType === "installation" ? `x-access-token:${token}` : token;

        ghAuth = tokenWithPrefix as string;
    }

    const git = await GitCommander.create(repoDir, ghAuth);
    // Clone the repo to repoDir and update the branch
    await git.clone(repository.clone_url);
    git.setWorkingDirectory(fullRepoPath);
    if (!(await git.tryFetch(branchRemoteName, OPENAPI_UPDATE_BRANCH))) {
        await git.checkout(OPENAPI_UPDATE_BRANCH, undefined, ["-b"]);
        await git.exec(["merge", "-X", "theirs", `${branchRemoteName}/${repository.default_branch}`]);
    } else {
        await git.checkout(OPENAPI_UPDATE_BRANCH, undefined, []);
    }

    // Parse the generators config
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

    if (origin != undefined && (await git.isDirty(true))) {
        // Add + commit files
        await git.add(["-A"]);
        await git.commit(["-m", ":herb: Update API Spec"]);

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

export async function updateOpenApiSpecs(env: Env): Promise<void> {
    console.log("Beginning scheduled run of `updateOpenApiSpecs`");
    const app: App = setupGithubApp(env);

    await app.eachRepository(
        async (installation) => await updateOpenApiSpec(installation.octokit, installation.repository),
    );
}
