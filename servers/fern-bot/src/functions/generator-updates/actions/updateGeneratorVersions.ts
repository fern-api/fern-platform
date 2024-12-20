import { Env } from "@libs/env";
import { setupGithubApp } from "@libs/github/octokit";
import { App } from "octokit";
import { updateVersionInternal } from "../shared/updateGeneratorInternal";

export async function updateGeneratorVersionsInternal(env: Env): Promise<void> {
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
        await updateVersionInternal(
            installation.octokit,
            installation.repository,
            env.GITHUB_APP_LOGIN_NAME,
            env.GITHUB_APP_LOGIN_ID,
            env.DEFAULT_FDR_ORIGIN,
            env.FERNIE_SLACK_APP_TOKEN,
            env.CUSTOMER_ALERTS_SLACK_CHANNEL,
        );
    });
}
