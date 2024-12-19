import posthog, { type PostHog } from "posthog-js";
import { ReactNode, useEffect } from "react";
import { useApiRoute, useFernUser } from "../atoms";
import { useRouteChangeComplete } from "../hooks/useRouteChanged";
import { useSafeListenTrackEvents } from "./track";

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

export function Posthog(): ReactNode {
    const route = useApiRoute("/api/fern-docs/analytics/posthog");

    // initialize the posthog instance
    useEffect(() => {
        const token = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
        if (token == null) {
            // eslint-disable-next-line no-console
            console.warn("Posthog will NOT be initialized.");
            return;
        }

        posthog.init(token, {
            api_host: route,
            capture_pageview: true,
            capture_pageleave: true,
        });
    }, [route]);

    // identify the user after the posthog instance is initialized
    const user = useFernUser();
    useEffect(() => {
        if (user && user.email && posthog._isIdentified()) {
            posthog.identify(user.email);
        } else if (posthog._isIdentified()) {
            posthog.reset();
        }
    }, [user]);

    // capture pageviews
    useRouteChangeComplete(() => {
        // posthog doesn't handle this automatically: https://posthog.com/docs/libraries/next-js#pageview
        posthog.capture("$pageview");
    });

    // capture events
    useSafeListenTrackEvents(({ event, properties }) => {
        posthog.capture(event, properties);
    }, true);

    return false;
}

export function CustomerPosthog({ token, api_host }: { token: string; api_host?: string }): ReactNode {
    // initialize the posthog instance
    useEffect(() => {
        posthog.init(
            token,
            {
                api_host,
                capture_pageview: true,
                capture_pageleave: true,
            },
            "customer",
        );
    }, [token, api_host]);

    // identify the user after the posthog instance is initialized
    const user = useFernUser();
    useEffect(() => {
        if (user && user.email && getCustomerPosthog()) {
            getCustomerPosthog()?.identify(user.email);
        } else if (getCustomerPosthog()?._isIdentified()) {
            getCustomerPosthog()?.reset();
        }
    }, [user]);

    // capture pageviews
    useRouteChangeComplete(() => {
        // posthog doesn't handle this automatically: https://posthog.com/docs/libraries/next-js#pageview
        getCustomerPosthog()?.capture("$pageview");
    });

    // capture events
    useSafeListenTrackEvents(({ event, properties }) => {
        getCustomerPosthog()?.capture(event, properties);
    }, true);

    return false;
}

function getCustomerPosthog(): PostHog | undefined {
    if (posthogHasCustomer(posthog)) {
        return posthog.customer;
    }
    return undefined;
}
