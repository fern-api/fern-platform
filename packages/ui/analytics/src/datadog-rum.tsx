import { datadogRum, type RumInitConfiguration } from "@datadog/browser-rum";
import { ReactNode, useEffect } from "react";
import { useSafeListenTrackEvents } from "./use-track";
import { useUserInfo } from "./user";

export default function DatadogRumScript(props: RumInitConfiguration): ReactNode {
    useEffect(() => {
        datadogRum.init(props);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const user = useUserInfo();
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
