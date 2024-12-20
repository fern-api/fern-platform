import { init, track } from "@amplitude/analytics-browser";
import { ReactNode, useEffect } from "react";
import { useSafeListenTrackEvents } from "./use-track";

export default function AmplitudeScript({ apiKey }: { apiKey: string }): ReactNode {
    useEffect(() => {
        try {
            init(apiKey, undefined, {
                autocapture: true,
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Error initializing Amplitude", e);
        }
    }, [apiKey]);

    useSafeListenTrackEvents(({ event, properties }) => {
        track(event, properties);
    });

    return false;
}
