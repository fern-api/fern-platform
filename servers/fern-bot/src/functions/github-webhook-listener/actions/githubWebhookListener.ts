import { Env } from "@libs/env";
import { App } from "octokit";
import { setupGithubApp } from "@libs/github";

export async function handleIncomingRequest(request: Request, env: Env): Promise<Response> {
    const application: App = setupGithubApp(env);
    // Process the incoming events
    await actionWebhook(application);

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

interface RunId {
    // TODO: This should become some union of strings/enums of possible actions we can switch on in the check_run function
    action: "sdk_preview";
    organizationId: string;
    language: string;
    generatorId: string;
    githubRepository: string;
}

function stringifyRunId(runId: RunId): string {
    return JSON.stringify(runId);
}

// function deserializeRunId(stringifiedRunId: string): RunId {
//     // TODO: we should throw here if it cannot deserialize correctly
//     return JSON.parse(stringifiedRunId) as RunId;
// }

const actionWebhook = async (app: App): Promise<void> => {
    app.log.info("Listening for issues.labeled webhooks");

    // Adding checks for preview as outlined in
    // https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-ci-checks-with-a-github-app
    //
    // With this event, github is saying that a repo this app is installed on has a commit that should be running checks
    // We check that it is a Fern config repo and then declare to github that we will be running SDK previews if so
    app.webhooks.on("check_suite", async (context) => {
        const action = context.payload.action;
        if (action === "requested" || action === "rerequested") {
            app.log.info(`A check run was requested: ${action}`);

            //TODO: Check that it's a fern config repo
            // Then actually create a check run SDK per-repo
            await app.octokit.rest.checks.create({
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                owner: context.payload.repository.owner.name!,
                repo: context.payload.repository.name,
                name: ":herb: SDK Preview",
                head_sha: context.payload.check_suite.head_sha,
                // TODO: fill this out with the repo data
                external_id: stringifyRunId({
                    action: "sdk_preview",
                    language: "",
                    organizationId: "",
                    generatorId: "",
                    githubRepository: "",
                }),
            });
        }
    });

    // With this event, github is telling us that a check run has officially been kicked off
    // We want to:
    //  1. Update the status to in_progress
    //  2. Pull the SDK repo
    //  3. Kick off the checks (from generator CRUD API)
    //  4. Complete the action with the checks status
    //    4a. Include detailed logs in the `output` block
    //
    // Note we do not want to use `actions` or `details_url` right now as actions issues
    // a response back to us which we don't currently need, and the details_url would be to
    // link to an external resource, as Chromatic does
    //
    // TODO: `actions` would be a good vector for kicking off a release after viewing the preview, etc.
    app.webhooks.on("check_run", async (context) => {
        // Now you know you've been given a check to run
        const action = context.payload.action;

        if (action === "rerequested" || action === "created") {
            // const runId = deserializeRunId(context.payload.check_run.external_id);

            // TODO: Parse the runId and then run an action based on the `action` field

            // Tell github we're working on this now
            await app.octokit.rest.checks.update({
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                owner: context.payload.repository.owner.name!,
                repo: context.payload.repository.name,
                check_run_id: context.payload.check_run.id,
                status: "in_progress",
            });

            // DO THE ACTUAL ACTION

            // Tell github we're done and deliver the deets
            await app.octokit.rest.checks.update({
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                owner: context.payload.repository.owner.name!,
                repo: context.payload.repository.name,
                check_run_id: context.payload.check_run.id,
                status: "completed",
                // TODO: update status, depending on checks
                conclusion: "success",
                // TODO: update the output with the output from the check run
                output: {
                    title: "Preview ${TODO}",
                    summary: "summary",
                    text: "text",
                },
            });
        }
    });
};
