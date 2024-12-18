import * as Fathom from "fathom-client";
import { ReactNode, useEffect } from "react";
import { useRouteChangeComplete } from "../hooks/useRouteChanged";
import { useSafeListenTrackEvents } from "./track";

export function FathomScript({ siteId }: { siteId: string }): ReactNode {
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
