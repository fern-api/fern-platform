import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { Env } from "@libs/env";
import { components } from "@octokit/openapi-types";
import * as fs from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { App, Octokit } from "octokit";
import * as path from "path";
import simpleGit from "simple-git";
import { Readable } from "stream";
import { finished } from "stream/promises";
import tmp from "tmp-promise";
import { API_ORIGIN_LOCATION_KEY, ASYNC_API_LOCATION_KEY, OPENAPI_LOCATION_KEY } from "../fern-cli/schemas";
import { getFernDirectory, loadRawGeneratorsConfiguration } from "../fern-cli/utilities";
import { setupGithubApp } from "../github/octokit";
import { createOrUpdatePullRequest } from "../github/utilities";

const OPENAPI_UPDATE_BRANCH = "fern/update-api-specs";
type Repository = components["schemas"]["repository"];

async function fetchAndWriteFile(url: string, path: string): Promise<void> {
    const resp = await fetch(url);
    if (resp.ok && resp.body) {
        console.debug("Origin successfully fetched, writing to file");
        // Write file to disk
        const fileStream = fs.createWriteStream(path);
        await finished(Readable.fromWeb(resp.body).pipe(fileStream));

        // Read and format file
        const fileContents = await readFile(path, "utf8");
        try {
            await writeFile(path, JSON.stringify(JSON.parse(fileContents), undefined, 2), "utf8");
        } catch (e) {
            await writeFile(path, yaml.dump(yaml.load(fileContents)), "utf8");
        }
        console.debug("File written successfully");
    }
}

async function updateOpenApiSpecInternal(octokit: Octokit, repository: Repository): Promise<void> {
    const tmpDir = await tmp.dir();
    const fullRepoPath = AbsoluteFilePath.of(path.join(tmpDir.path, repository.id.toString(), repository.name));

    const branchRemoteName = "origin";

    console.log(`Cloning repo: ${repository.clone_url} to ${fullRepoPath}`);
    if (!(await doesPathExist(fullRepoPath))) {
        await mkdir(fullRepoPath, { recursive: true });
    }

    const git = simpleGit(fullRepoPath);
    // Clone the repo to fullRepoPath and update the branch
    await git.clone(repository.clone_url, ".");
    try {
        // If you can fetch the branch, checkout the branch
        await git.fetch(branchRemoteName, OPENAPI_UPDATE_BRANCH);
        console.log(`Branch exists, checking out`);
        await git.checkout(OPENAPI_UPDATE_BRANCH);
        // Merge the default branch into this branch to update it
        // prefer the default branch changes
        //
        // TODO: we could honestly probably just delete the branch and recreate it
        // my concern with that is if there are more changes we decide to make in other actions
        // to the same branch that are not OpenAPI related, that we'd lose if we deleted and reupdated the spec.
        await git.merge(["-X", "theirs", `${branchRemoteName}/${repository.default_branch}`]);
    } catch (e) {
        console.log(`Branch does not exist, create and checkout`);
        await git.checkoutBranch(OPENAPI_UPDATE_BRANCH, branchRemoteName);
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
    console.log("Checking for API spec to update");
    console.log(JSON.stringify(generatorConfig, null, 2));
    const fernDirectory = await getFernDirectory(fullRepoPath);
    if (generatorConfig.api != null) {
        let apis;
        if (generatorConfig.api instanceof Array) {
            apis = generatorConfig.api;
        } else {
            apis = [generatorConfig.api];
        }
        for (const api of apis) {
            if (typeof api !== "string" && api.origin != null) {
                console.log("Origin found, fetching spec from ", api.origin);
                origin = api.origin;
                await fetchAndWriteFile(api.origin, path.join(fernDirectory, api.path));
            }
        }
    } else if (generatorConfig[ASYNC_API_LOCATION_KEY] != null) {
        if (generatorConfig[API_ORIGIN_LOCATION_KEY] != null) {
            console.log("Origin found, fetching spec from ", generatorConfig[API_ORIGIN_LOCATION_KEY]);
            origin = generatorConfig[API_ORIGIN_LOCATION_KEY];
            await fetchAndWriteFile(
                generatorConfig[API_ORIGIN_LOCATION_KEY],
                path.join(fernDirectory, generatorConfig[ASYNC_API_LOCATION_KEY]),
            );
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
            origin = apiOrigin;
            console.log("Origin found, fetching spec from ", apiOrigin);
            await fetchAndWriteFile(apiOrigin, path.join(fernDirectory, apiOutput));
        }
    }

    console.log("Checking for changes to commit and push");
    if (origin != undefined && !(await git.status()).isClean()) {
        console.log("Changes detected, committing and pushing");
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
