import type { ApplicationFunction } from "probot/lib/types";

import { evaluateEnv } from "@libs/env";
import { Probot } from "probot";
import { actionWebhook } from "./actions/githubWebhookListener";

// Enforce some Probot typing on the function we're exporting
const githubWebhookListener: ApplicationFunction = async (app: Probot) => {
    console.debug("Beginning scheduled run of `githubWebhookListener");
    const env = evaluateEnv();
    console.debug("Environment evaluated, continuing to set up the webhook receivers.");
    await actionWebhook(app, env);
};

// It seems like Probot requires a default export?
export default githubWebhookListener;
