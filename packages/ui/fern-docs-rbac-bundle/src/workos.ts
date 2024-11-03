import { WorkOS } from "@workos-inc/node";

function getWorkosApiKey(): string {
    if (!process.env.WORKOS_API_KEY) {
        throw new Error("WORKOS_API_KEY is not set");
    }

    return process.env.WORKOS_API_KEY;
}

export function getWorkosWebhookSecret(): string {
    if (!process.env.WORKOS_WEBHOOK_SECRET) {
        throw new Error("WORKOS_WEBHOOK_SECRET is not set");
    }

    return process.env.WORKOS_WEBHOOK_SECRET;
}

export const workos = (): WorkOS => new WorkOS(getWorkosApiKey());
