import mixpanel from "mixpanel-browser";
import { ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "swr/_internal";

export default function MixpanelScript({ token }: { token: string }): ReactNode {
    useIsomorphicLayoutEffect(() => {
        mixpanel.init(token, {
            track_pageview: true,
        });
    }, [token]);
    return null;
}
