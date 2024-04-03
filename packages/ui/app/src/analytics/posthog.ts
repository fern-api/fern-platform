import { DocsV2Read } from "@fern-api/fdr-sdk";
import posthog from "posthog-js";

let IS_POSTHOG_INITIALIZED = false;
function safeAccessPosthog(run: () => void): void {
    if (IS_POSTHOG_INITIALIZED) {
        run();
    }
}

function getPosthogUIHost(baseUrl: DocsV2Read.BaseUrl): string {
    // window.location.host is required for subpath rewrite support.
    const host = typeof window !== "undefined" ? window.location.host : baseUrl.domain;

    return `https://${host}${baseUrl.basePath ?? ""}/api/fern-docs/ingest`;
}

export function initializePosthog(baseUrl: DocsV2Read.BaseUrl): void {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY?.trim();
    if (process.env.NODE_ENV === "production" && apiKey != null && apiKey.length > 0 && !IS_POSTHOG_INITIALIZED) {
        posthog.init(apiKey, {
            ui_host: "https://app.posthog.com",
            api_host: getPosthogUIHost(baseUrl),
            loaded: () => {
                IS_POSTHOG_INITIALIZED = true;
            },
        });
    }
}

export function identifyUser(userId: string): void {
    safeAccessPosthog(() => {
        posthog.identify(userId);
    });
}

export function registerPosthogProperties(properties: Record<string, unknown>): void {
    safeAccessPosthog(() => {
        posthog.register(properties);
    });
}

export function resetPosthog(): void {
    safeAccessPosthog(() => {
        posthog.reset();
    });
}

export function capturePosthogEvent(eventName: string, properties?: Record<string, unknown>): void {
    safeAccessPosthog(() => {
        posthog.capture(eventName, properties);
    });
}
