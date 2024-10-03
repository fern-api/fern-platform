import { Env } from "@libs/env";
import { setupGithubApp } from "@libs/github";
import { App } from "octokit";
import { deserializeRunId } from "./utilities";
import { previewSdk, runDefaultAction } from "./previewSdk";
import { initiatePreviewRuns } from "./initiatePreviewRuns";

export async function handleIncomingRequest(request: Request, env: Env): Promise<Response> {
    const application: App = setupGithubApp(env);
    // Process the incoming events
    await actionWebhook(application, env);

    try {
        // Verify the incoming webhook before proceeding
        await verifySignature(application, request);

        return new Response("{ 'ok': true }", {
            headers: { "content-type": "application/json" },
        });
    } catch (error) {
        return new Response(`{ "error": "${error}" }`, {
            status: 500,
            headers: { "content-type": "application/json" },
        });
    }
}

const verifySignature = async (app: App, request: Request): Promise<void> => {
    const eventName = request.headers.get("X-GitHub-Event");
    if (eventName == null) {
        throw new Error("Missing X-GitHub-Event header");
    }
    await app.webhooks.verifyAndReceive({
        id: request.headers.get("X-GitHub-Delivery") ?? "x-github-delivery",
        // @ts-expect-error: octokit does not export the type needed here to be able to cast
        name: eventName,
        signature: request.headers.get("X-Hub-Signature-256")?.replace(/sha256=/, "") ?? "",
        payload: await request.json(),
    });
};

const actionWebhook = async (app: App, env: Env): Promise<void> => {
    app.log.info("Listening for webhooks");

    // Adding checks for preview as outlined in
    // https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-ci-checks-with-a-github-app
    //
    // With this event, github is saying that a repo this app is installed on has a commit that should be running checks
    // We check that it is a Fern config repo and then declare to github that we will be running SDK previews if so
    app.webhooks.on("check_suite", async (context) => {
        const action = context.payload.action;
        if (action === "requested" || action === "rerequested") {
            app.log.info(`A check run was requested: ${action}`);

            // Kick off SDK previews
            await initiatePreviewRuns({
                context,
                app,
                fernBotLoginName: env.GITHUB_APP_LOGIN_NAME,
                fernBotLoginId: env.GITHUB_APP_LOGIN_ID,
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

        if (action === "rerequested" || action === "created") {
            const runId = deserializeRunId(context.payload.check_run.external_id);

            // Add new run actions here:
            switch (runId.action) {
                case "sdk_preview":
                    await previewSdk({
                        context,
                        app,
                        fernBotLoginName: env.GITHUB_APP_LOGIN_NAME,
                        fernBotLoginId: env.GITHUB_APP_LOGIN_ID,
                        runId,
                        fdrUrl: env.DEFAULT_FDR_ORIGIN,
                    });
                    break;
                default:
                    await runDefaultAction({ context, app });
            }
        }
    });
};
