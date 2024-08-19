import { DocsV1Read } from "@fern-api/fdr-sdk";
import * as sentry from "@sentry/nextjs";
import { Router } from "next/router";
import posthog, { PostHog } from "posthog-js";
import { useEffect } from "react";

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
function safeAccessPosthog(run: () => void): void {
    if (IS_POSTHOG_INITIALIZED) {
        run();
    }
}

/**
 * Safely runs the given logic if the global posthog instance has a secondary capturing object for a customer.
 *
 * @param run
 */
function ifCustomer(run: (hog: PostHogWithCustomer) => void): void {
    if (IS_POSTHOG_INITIALIZED && posthogHasCustomer(posthog)) {
        run(posthog);
    }
}

export function initializePosthog(customerConfig?: DocsV1Read.PostHogConfig): void {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY?.trim();
    if (process.env.NODE_ENV === "production" && apiKey != null && apiKey.length > 0 && !IS_POSTHOG_INITIALIZED) {
        const posthogProxy = "/api/fern-docs/analytics/posthog";

        posthog.init(apiKey, {
            api_host: posthogProxy,
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
                    api_host: posthogProxy,
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
    safeAccessPosthog(() => {
        posthog.identify(userId);
        ifCustomer((posthog) => posthog.customer.identify(userId));
    });
}

export function registerPosthogProperties(properties: Record<string, unknown>): void {
    safeAccessPosthog(() => {
        posthog.register(properties);
        ifCustomer((posthog) => posthog.customer.register(properties));
    });
}

export function resetPosthog(): void {
    safeAccessPosthog(() => {
        posthog.reset();
        ifCustomer((posthog) => posthog.customer.reset());
    });
}

export function capturePosthogEvent(eventName: string, properties?: Record<string, unknown>): void {
    safeAccessPosthog(() => {
        posthog.capture(eventName, properties);
        ifCustomer((posthog) => posthog.customer.capture(eventName, properties));
    });
}

// Track page views
const handleRouteChange = (url: string) => {
    try {
        capturePosthogEvent("$pageview");
        typeof window !== "undefined" &&
            window?.analytics &&
            typeof window.analytics.page === "function" &&
            window?.analytics?.page("Page View", { page: url });
    } catch (e) {
        //send the exception to sentry
        sentry.captureException(e);
        // eslint-disable-next-line no-console
        console.error("Failed to track page view", e);
    }
};

export function useInitializePosthog(customerConfig?: DocsV1Read.PostHogConfig): void {
    useEffect(() => {
        initializePosthog(customerConfig);

        Router.events.on("routeChangeComplete", handleRouteChange);
        return () => {
            Router.events.off("routeChangeComplete", handleRouteChange);
        };
    }, [customerConfig]);
}
