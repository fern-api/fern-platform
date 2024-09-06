import type { DocsV1Read } from "@fern-api/fdr-sdk";
import { Router } from "next/router";
import type { PostHog } from "posthog-js";
import { useEffect } from "react";
import { useApiRoute } from "../hooks/useApiRoute";
import { safeCall } from "./sentry";

/**
 * Posthog natively allows us to define additional capture objects with distinct configs on the global instance,
 * via the `posthog.init` method.
 *
 * When customers provide a custom PostHog config, we funnel posthog events to our posthog instance
 * as well as theirs. However, Posthog doesn't provide types for this yet in their js sdk, so
 */
type PostHogWithCustomer = PostHog & {
    customer: PostHog;
};

/**
 * @param instance
 * @returns whether the given posthog instance has a secondary capturing object for a customer.
 */
function posthogHasCustomer(instance: PostHog): instance is PostHogWithCustomer {
    return Boolean((instance as PostHogWithCustomer).customer);
}

let IS_POSTHOG_INITIALIZED = false;
async function safeAccessPosthog(run: (posthog: PostHog) => void): Promise<void> {
    if (IS_POSTHOG_INITIALIZED) {
        const posthog = (await import("posthog-js")).default;
        safeCall(() => run(posthog));
    }
}

/**
 * Safely runs the given logic if the global posthog instance has a secondary capturing object for a customer.
 *
 * @param run
 */
function ifCustomer(posthog: PostHog, run: (hog: PostHogWithCustomer) => void): void {
    safeCall(() => {
        if (IS_POSTHOG_INITIALIZED && posthogHasCustomer(posthog)) {
            run(posthog);
        }
    });
}

export async function initializePosthog(api_host: string, customerConfig?: DocsV1Read.PostHogConfig): Promise<void> {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY?.trim();
    if (process.env.NODE_ENV === "production" && apiKey != null && apiKey.length > 0 && !IS_POSTHOG_INITIALIZED) {
        const posthog = (await import("posthog-js")).default;

        posthog.init(apiKey, {
            api_host,
            loaded: () => {
                IS_POSTHOG_INITIALIZED = true;
            },
            capture_pageview: true,
            capture_pageleave: true,
        });

        if (customerConfig) {
            posthog.init(
                customerConfig.apiKey,
                {
                    api_host,
                    request_headers: {
                        // default to posthog-js's default endpoint
                        // this is probably the expected behavior
                        "x-fern-posthog-host": customerConfig.endpoint ?? "https://us.i.posthog.com",
                    },
                },
                "customer",
            );
        }
    }
}

export function identifyUser(userId: string): void {
    void safeAccessPosthog((posthog) => {
        posthog.identify(userId);
        ifCustomer(posthog, (posthog) => posthog.customer.identify(userId));
    });
}

export function registerPosthogProperties(properties: Record<string, unknown>): void {
    void safeAccessPosthog((posthog) => {
        posthog.register(properties);
        ifCustomer(posthog, (posthog) => posthog.customer.register(properties));
    });
}

export function resetPosthog(): void {
    void safeAccessPosthog((posthog) => {
        posthog.reset();
        ifCustomer(posthog, (posthog) => posthog.customer.reset());
    });
}

export function capturePosthogEvent(eventName: string, properties?: Record<string, unknown>): void {
    void safeAccessPosthog((posthog) => {
        posthog.capture(eventName, properties);
        ifCustomer(posthog, (posthog) => posthog.customer.capture(eventName, properties));
    });
}

const trackPageView = (url: string) => {
    safeCall(() => {
        capturePosthogEvent("$pageview");
        typeof window !== "undefined" &&
            window?.analytics &&
            typeof window.analytics.page === "function" &&
            window?.analytics?.page("Page View", { page: url });
    });
};

export function useInitializePosthog(customerConfig?: DocsV1Read.PostHogConfig): void {
    const route = useApiRoute("/api/fern-docs/analytics/posthog");
    useEffect(() => {
        safeCall(() => initializePosthog(route, customerConfig));
        Router.events.on("routeChangeComplete", trackPageView);
        return () => {
            Router.events.off("routeChangeComplete", trackPageView);
        };
    }, [customerConfig, route]);
}
