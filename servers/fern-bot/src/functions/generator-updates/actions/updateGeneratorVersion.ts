import { Env } from "@libs/env";
import { setupGithubApp } from "@libs/github/octokit";
import { RepoData } from "@libs/schemas";
import { App } from "octokit";
import { updateVersionInternal } from "../shared/updateGeneratorInternal";

export async function updateGeneratorVersionInternal(env: Env, repoData: RepoData): Promise<void> {
    const app: App = setupGithubApp(env);

    // There has to be a better way to do this, but I couldn't find a great way to get the installation ID
    await app.eachRepository(async (installation) => {
        if (installation.repository.full_name === repoData.full_name) {
            await updateVersionInternal(
                installation.octokit,
                installation.repository,
                env.GITHUB_APP_LOGIN_NAME,
                env.GITHUB_APP_LOGIN_ID,
                env.DEFAULT_FDR_ORIGIN,
                env.FERNIE_SLACK_APP_TOKEN,
                env.CUSTOMER_ALERTS_SLACK_CHANNEL,
            );
        }
    });
}
