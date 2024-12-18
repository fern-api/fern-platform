import * as Fathom from "fathom-client";
import { ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "swr/_internal";
import { useRouteChangeComplete } from "../hooks/useRouteChanged";

export function FathomScript({ siteId }: { siteId: string }): ReactNode {
    useIsomorphicLayoutEffect(() => {
        Fathom.load(siteId);
    }, [siteId]);

    useRouteChangeComplete(() => {
        Fathom.trackPageview();
    });

    return false;
}
