import * as amplitude from "@amplitude/analytics-browser";
import { ReactNode, useEffect } from "react";
import { useSafeListenTrackEvents } from "./track";

export default function AmplitudeScript({ apiKey }: { apiKey: string }): ReactNode {
    useEffect(() => {
        try {
            amplitude.init(apiKey, undefined, {
                autocapture: true,
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Error initializing Amplitude", e);
        }
    }, [apiKey]);

    useSafeListenTrackEvents(({ event, properties }) => {
        amplitude.track(event, properties);
    });

    return false;
}
