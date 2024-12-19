import mixpanel from "mixpanel-browser";
import { ReactNode, useEffect } from "react";
import { useFernUser } from "../atoms";
import { useSafeListenTrackEvents } from "./track";

export function MixpanelScript({ token }: { token: string }): ReactNode {
    useEffect(() => {
        mixpanel.init(token, {
            track_pageview: true,
        });
    }, [token]);

    const user = useFernUser();
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
