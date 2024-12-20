import * as Fathom from "fathom-client";
import { ReactNode, useEffect } from "react";
import { useRouteChangeComplete } from "./use-route-changed";
import { useSafeListenTrackEvents } from "./use-track";

export default function FathomScript({ siteId }: { siteId: string }): ReactNode {
    useEffect(() => {
        Fathom.load(siteId);
    }, [siteId]);

    useRouteChangeComplete(() => {
        Fathom.trackPageview();
    });

    useSafeListenTrackEvents(({ event, properties }) => {
        Fathom.trackEvent(event, properties);
    });

    return false;
}
