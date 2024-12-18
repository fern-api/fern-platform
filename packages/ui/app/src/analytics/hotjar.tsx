import Hotjar from "@hotjar/browser";
import { ReactNode, useEffect } from "react";
import { useRouteChangeComplete } from "../hooks/useRouteChanged";
import { useSafeListenTrackEvents } from "./track";

export default function HotjarScript({ id, version }: { id: string; version: string }): ReactNode {
    useEffect(() => {
        Hotjar.init(Number(id), Number(version));
    }, [id, version]);

    useRouteChangeComplete((route) => {
        Hotjar.stateChange(route);
    });

    useSafeListenTrackEvents(({ event }) => {
        Hotjar.event(event);
    });

    return false;
}
