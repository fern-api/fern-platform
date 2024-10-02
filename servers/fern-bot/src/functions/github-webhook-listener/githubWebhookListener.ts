// import { evaluateEnv } from "@libs/env";
import { handlerWrapper } from "@libs/handler-wrapper";
// import { handleIncomingRequest } from "./actions/githubWebhookListener";

const githubWebhookListener = async (event: unknown) => {
    console.debug("Beginning scheduled run of `githubWebhookListener`, received event:", event);
    // const env = evaluateEnv();
    console.debug("Environment evaluated, continuing to actual action execution.");
    // return await handleIncomingRequest(event as Request, env);
};

export const handler = handlerWrapper(githubWebhookListener);
