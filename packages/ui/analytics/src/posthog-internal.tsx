import posthog from "posthog-js";
import { ReactNode, useEffect } from "react";
import { useRouteChangeComplete } from "./use-route-changed";
import { useSafeListenTrackEvents } from "./use-track";
import { useUserInfo } from "./user";

export default function Posthog({ route }: { route: string }): ReactNode {
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
    const user = useUserInfo();
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
