import mixpanel from "mixpanel-browser";
import { ReactNode, useEffect } from "react";
import { useSafeListenTrackEvents } from "./track";

export default function MixpanelScript({ token }: { token: string }): ReactNode {
    useEffect(() => {
        mixpanel.init(token, {
            track_pageview: true,
        });
    }, [token]);

    useSafeListenTrackEvents(({ event, properties }) => {
        mixpanel.track(event, properties);
    });

    return null;
}
