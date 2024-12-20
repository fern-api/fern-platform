import mixpanel from "mixpanel-browser";
import { ReactNode, useEffect } from "react";
import { useSafeListenTrackEvents } from "./use-track";
import { useUserInfo } from "./user";

export default function MixpanelScript({ token }: { token: string }): ReactNode {
    useEffect(() => {
        mixpanel.init(token, {
            track_pageview: true,
        });
    }, [token]);

    const user = useUserInfo();
    useEffect(() => {
        if (user?.email) {
            mixpanel.identify(user.email);
        }
    }, [user]);

    useSafeListenTrackEvents(({ event, properties }) => {
        mixpanel.track(event, properties);
    });

    return null;
}
