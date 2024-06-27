import { Env } from "@libs/env";
import { setupGithubApp } from "@libs/github";
import { App } from "octokit";
import { updateSpecInternal } from "../shared/updateSpecInternal";

export async function updateOpenApiSpecsInternal(env: Env): Promise<void> {
    const app: App = setupGithubApp(env);

    let foundRepo = false;
    if (env.REPO_TO_RUN_ON !== undefined) {
        console.log("REPO_TO_RUN_ON has been specified, only running on:", env.REPO_TO_RUN_ON);
    }
    await app.eachRepository(async (installation) => {
        // Github repo and org names are case insentitive, so we should compare them as both lowercase
        if (
            env.REPO_TO_RUN_ON !== undefined &&
            installation.repository.full_name.toLowerCase() !== env.REPO_TO_RUN_ON.toLowerCase()
        ) {
            return;
        } else if (env.REPO_TO_RUN_ON !== undefined) {
            console.log("REPO_TO_RUN_ON has been found, running logic.");
            foundRepo = true;
        }

        await updateSpecInternal(
            installation.octokit,
            {
                id: installation.repository.id.toString(),
                name: installation.repository.name,
                full_name: installation.repository.full_name,
                default_branch: installation.repository.default_branch,
                clone_url: installation.repository.clone_url,
            },
            env.GITHUB_APP_LOGIN_NAME,
            env.GITHUB_APP_LOGIN_ID,
        );
    });

    if (!foundRepo && env.REPO_TO_RUN_ON !== undefined) {
        console.log("REPO_TO_RUN_ON has been specified, but no matching repos were found, so no action was taken.");
    }
}
