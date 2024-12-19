import { datadogRum, type RumInitConfiguration } from "@datadog/browser-rum";
import { ReactNode, useEffect } from "react";
import { useFernUser } from "../atoms";
import { useSafeListenTrackEvents } from "./use-track";

export function DatadogRumScript(props: RumInitConfiguration): ReactNode {
    useEffect(() => {
        datadogRum.init(props);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const user = useFernUser();
    useEffect(() => {
        if (user) {
            datadogRum.setUser({ email: user.email, name: user.name });
        } else {
            datadogRum.clearUser();
        }
    }, [user]);

    useSafeListenTrackEvents(({ event, properties }) => {
        datadogRum.addAction(event, properties);
    });

    return false;
}
