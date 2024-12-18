import * as amplitude from "@amplitude/analytics-browser";
import { ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "swr/_internal";

export default function AmplitudeScript({ apiKey }: { apiKey: string }): ReactNode {
    useIsomorphicLayoutEffect(() => {
        try {
            amplitude.init(apiKey, undefined, {
                autocapture: true,
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Error initializing Amplitude", e);
        }
    }, [apiKey]);

    return false;
}
