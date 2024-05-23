import { Env } from "@libs/env";
import { App } from "octokit";
import { dashboard, setupGithubApp } from "./octokit";

export async function handleIncomingRequest(request: Request, env: Env): Promise<Response> {
    const application: App = setupGithubApp(env);
    await webhooks(application);

    // display installation dashboard
    if (request.method === "GET") {
        return dashboard(application);
    }

    // else verify webhook signature
    try {
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
    const eventName = request.headers.get("x-github-event");
    if (eventName == null) {
        throw new Error("Missing x-github-event header");
    }
    await app.webhooks.verifyAndReceive({
        id: request.headers.get("x-github-delivery") ?? "x-github-delivery",
        // @ts-expect-error: octokit does not export the type needed here to be able to cast
        name: eventName,
        signature: request.headers.get("x-hub-signature-256")?.replace(/sha256=/, "") ?? "",
        payload: await request.text(),
    });
};

const webhooks = async (app: App): Promise<void> => {
    app.log.info("Listening for issues.labeled webhooks");

    app.webhooks.on("issues.labeled", async (context) => {
        const label = context.payload.label;
        app.log.info("Encountered labeled issue, noop", label);

        // // send post request using fetch to webhook
        // await fetch(webhook, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(params),
        // });
    });
};
