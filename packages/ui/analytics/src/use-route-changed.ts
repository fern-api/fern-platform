import { Router } from "next/router";
import { useEffect, useRef } from "react";

export function useRouteChangeComplete(callback: (route: string) => void): void {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const handleRouteChangeComplete = (route: string) => {
            callbackRef.current(route);
        };
        Router.events.on("routeChangeComplete", handleRouteChangeComplete);
        return () => {
            Router.events.off("routeChangeComplete", handleRouteChangeComplete);
        };
    }, []);
}
