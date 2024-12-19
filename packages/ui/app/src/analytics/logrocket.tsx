import LogRocket from "logrocket";
import { ReactNode, useEffect } from "react";
import { useSafeListenTrackEvents } from "./use-track";

export function LogRocketScript({ appId }: { appId: string }): ReactNode {
    useEffect(() => {
        LogRocket.init(appId);
    }, [appId]);

    useSafeListenTrackEvents(({ event, properties }) => {
        LogRocket.track(event, properties as any);
    });

    return false;
}
