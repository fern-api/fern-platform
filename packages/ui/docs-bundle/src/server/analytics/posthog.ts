import { PostHog } from "posthog-node";

function getPosthogKey(): string {
    const key = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
    if (key == null) {
        throw new Error("NEXT_PUBLIC_POSTHOG_API_KEY is not set");
    }
    return key.trim();
}

export function getPosthog(): PostHog {
    return new PostHog(getPosthogKey(), {
        host: "https://us.i.posthog.com",
    });
}
