import Hotjar from "@hotjar/browser";
import { ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "swr/_internal";
import { useRouteChangeComplete } from "../hooks/useRouteChanged";

export default function HotjarScript({ id, version }: { id: string; version: string }): ReactNode {
    useIsomorphicLayoutEffect(() => {
        Hotjar.init(Number(id), Number(version));
    }, [id, version]);

    useRouteChangeComplete((route) => {
        Hotjar.stateChange(route);
    });

    return false;
}
