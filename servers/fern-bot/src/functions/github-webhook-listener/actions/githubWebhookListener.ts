import { Env } from "@libs/env";
import { deserializeRunId } from "./utilities";
import { previewSdk, runDefaultAction } from "./previewSdk";
import { initiatePreviewRuns } from "./initiatePreviewRuns";
import { Probot } from "probot";
import { setupGithubApp } from "@libs/github";
import { App } from "octokit";

export async function actionWebhook(app: Probot, env: Env): Promise<void> {
    app.log.info("Listening for webhooks");

    const githubApp: App = setupGithubApp(env);
    app.webhooks.on("pull_request.closed", (_) => {
        app.log.info("PR Closed");
    });

    app.webhooks.on("pull_request.opened", (_) => {
        app.log.info("PR Opened");
    });

    // Adding checks for preview as outlined in
    // https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-ci-checks-with-a-github-app
    //
    // With this event, github is saying that a repo this app is installed on has a commit that should be running checks
    // We check that it is a Fern config repo and then declare to github that we will be running SDK previews if so
    //
    // We might want to make this on PR open instead of this, which is every elligible commit (e.g. even to main)
    app.webhooks.on("check_suite", async (context) => {
        const action = context.payload.action;
        app.log.info(`A check run was requested: ${action}`);
        if (action === "requested" || action === "rerequested") {
            // Kick off SDK previews
            await initiatePreviewRuns({
                context,
                githubApp,
                fernBotLoginName: env.GITHUB_APP_LOGIN_NAME,
                fernBotLoginId: env.GITHUB_APP_LOGIN_ID,
                venusUrl: env.DEFAULT_VENUS_ORIGIN,
                fdrUrl: env.DEFAULT_FDR_ORIGIN,
            });
        }
    });

    // With this event, github is telling us that a check run has officially been kicked off
    //
    // Note we do not want to use `actions` or `details_url` right now as actions issues
    // a response back to us which we don't currently need, and the details_url would be to
    // link to an external resource, as Chromatic does
    //
    // TODO: `actions` would be a good vector for kicking off a release after viewing the preview, etc.
    app.webhooks.on("check_run", async (context): Promise<void> => {
        // Now you know you've been given a check to run
        const action = context.payload.action;

        if (context.payload.installation == null) {
            // This should never happen, as far as I know, but because we need an installation ID to be able to get the
            // installation Octokit below, we need to quit out of here for type-safety, ensuring the ID is there.
            throw new Error("No installation ID found, could not complete or update the queued check run.");
        }

        const installationOctokit = await githubApp.getInstallationOctokit(context.payload.installation.id);

        if (action === "rerequested" || action === "created") {
            const runId = deserializeRunId(context.payload.check_run.external_id);

            // Add new run actions here:
            switch (runId.action) {
                case "sdk_preview":
                    await previewSdk({
                        context,
                        installationOctokit,
                        fernBotLoginName: env.GITHUB_APP_LOGIN_NAME,
                        fernBotLoginId: env.GITHUB_APP_LOGIN_ID,
                        runId,
                        fdrUrl: env.DEFAULT_FDR_ORIGIN,
                    });
                    break;
                default:
                    await runDefaultAction({ context, installationOctokit });
            }
        }
    });
}
