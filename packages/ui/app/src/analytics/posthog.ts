import { DocsV1Read } from "@fern-api/fdr-sdk";
import posthog, { PostHog } from "posthog-js";

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
    if (apiKey != null && apiKey.length > 0 && !IS_POSTHOG_INITIALIZED) {
        posthog.init(apiKey, {
            api_host: "https://app.posthog.com",
            loaded: () => {
                IS_POSTHOG_INITIALIZED = true;
            },
            capture_pageview: true,
            capture_pageleave: true,
        });

        if (customerConfig) {
            posthog.init(customerConfig.apiKey, { api_host: customerConfig.endpoint }, "customer");
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
