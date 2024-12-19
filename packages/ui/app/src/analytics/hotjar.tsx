import Hotjar from "@hotjar/browser";
import { ReactNode, useEffect } from "react";
import { useFernUser } from "../atoms";
import { useRouteChangeComplete } from "../hooks/useRouteChanged";
import { useSafeListenTrackEvents } from "./track";

export function HotjarScript({ id, version }: { id: string; version: string }): ReactNode {
    useEffect(() => {
        Hotjar.init(Number(id), Number(version));
    }, [id, version]);

    const user = useFernUser();
    useEffect(() => {
        if (user) {
            const userInfo: Record<string, string> = {};
            if (user.name) {
                userInfo.name = user.name;
            }
            if (user.email) {
                userInfo.email = user.email;
            }
            Hotjar.identify(null, userInfo);
        }
    }, [user]);

    useRouteChangeComplete((route) => {
        Hotjar.stateChange(route);
    });

    // note: hotjar doesn't support properties :facepalm:
    useSafeListenTrackEvents(({ event }) => {
        Hotjar.event(event);
    });

    return false;
}
