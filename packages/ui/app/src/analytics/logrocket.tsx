import LogRocket from "logrocket";
import { ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "swr/_internal";

export default function LogRocketScript({ appId }: { appId: string }): ReactNode {
    useIsomorphicLayoutEffect(() => {
        LogRocket.init(appId);
    }, [appId]);
    return false;
}
