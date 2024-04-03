import { DocsV2Read } from "@fern-api/fdr-sdk";
import posthog from "posthog-js";

let IS_POSTHOG_INITIALIZED = false;
function safeAccessPosthog(run: () => void): void {
    if (IS_POSTHOG_INITIALIZED) {
        run();
    }
}

function getPosthogUIHost(baseUrl: DocsV2Read.BaseUrl): string {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" || process.env.NEXT_PUBLIC_VERCEL_ENV === "development") {
        return `http://${process.env.NEXT_PUBLIC_VERCEL_URL}${baseUrl.basePath ?? ""}/api/fern-docs/ingest`;
    }

    return `https://${baseUrl.domain}${baseUrl.basePath ?? ""}/api/fern-docs/ingest`;
}

export function initializePosthog(baseUrl: DocsV2Read.BaseUrl): void {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY?.trim();
    if (process.env.NODE_ENV === "production" && apiKey != null && apiKey.length > 0 && !IS_POSTHOG_INITIALIZED) {
        posthog.init(apiKey, {
            api_host: "https://app.posthog.com",
            ui_host: getPosthogUIHost(baseUrl),
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
