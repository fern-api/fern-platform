import { Env } from "@libs/env";
import { setupGithubApp } from "@libs/github";
import { RepoData } from "@libs/schemas";
import { App } from "octokit";
import { updateSpecInternal } from "../shared/updateSpecInternal";

export async function updateOpenApiSpecInternal(env: Env, repoData: RepoData): Promise<void> {
    const app: App = setupGithubApp(env);

    await updateSpecInternal(app.octokit, repoData, env.GITHUB_APP_LOGIN_NAME, env.GITHUB_APP_LOGIN_ID);
}
