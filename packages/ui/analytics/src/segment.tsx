import * as snippet from "@segment/snippet";
import Script from "next/script";
import { ReactNode, useEffect } from "react";
import { useSafeListenTrackEvents } from "./use-track";
import { useUserInfo } from "./user";

export default function SegmentScript(props: snippet.Options): ReactNode {
    const user = useUserInfo();

    useEffect(() => {
        try {
            if (user && window.analytics) {
                window.analytics.identify(user.email, {
                    name: user.name,
                    email: user.email,
                });
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Error identifying user with segment", e);
        }
    }, [user]);

    useSafeListenTrackEvents(({ event, properties }) => {
        if (window.analytics) {
            window.analytics.track(event, properties);
        }
    });

    return (
        <Script id="segment" type="text/javascript" dangerouslySetInnerHTML={{ __html: renderSegmentSnippet(props) }} />
    );
}

function renderSegmentSnippet(opts: snippet.Options): string {
    if (process.env.NODE_ENV === "development") {
        return snippet.max(opts);
    }
    return snippet.min(opts);
}
