import { Router } from "next/router";
import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "swr/_internal";

export function useRouteChangeComplete(
    callback: (route: string, shallow?: boolean) => void,
    destroy?: () => void,
): void {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const destroyRef = useRef(destroy);
    destroyRef.current = destroy;

    useIsomorphicLayoutEffect(() => {
        const handleRouteChange = (route: string, { shallow }: { shallow?: boolean }) => {
            callbackRef.current(route, shallow);
        };
        const handleRouteChangeError = (_err: Error, route: string, { shallow }: { shallow?: boolean }) => {
            callbackRef.current(route, shallow);
        };
        const handleHashChangeComplete = (route: string) => {
            callbackRef.current(route, true);
        };
        Router.events.on("routeChangeComplete", handleRouteChange);
        Router.events.on("routeChangeError", handleRouteChangeError);
        Router.events.on("hashChangeComplete", handleHashChangeComplete);
        return () => {
            Router.events.off("routeChangeComplete", handleRouteChange);
            Router.events.off("routeChangeError", handleRouteChangeError);
            Router.events.off("hashChangeComplete", handleHashChangeComplete);
            destroyRef.current?.();
        };
    }, []);
}

export function useRouteChangeStart(callback: (route: string, shallow?: boolean) => void, destroy?: () => void): void {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const destroyRef = useRef(destroy);
    destroyRef.current = destroy;

    useEffect(() => {
        const handleRouteChangeStart = (route: string, { shallow }: { shallow?: boolean }) => {
            callbackRef.current(route, shallow);
        };
        const handleHashChangeStart = (route: string) => {
            callbackRef.current(route, true);
        };
        Router.events.on("routeChangeStart", handleRouteChangeStart);
        Router.events.on("hashChangeStart", handleHashChangeStart);
        return () => {
            Router.events.off("routeChangeStart", handleRouteChangeStart);
            Router.events.off("hashChangeStart", handleHashChangeStart);
            destroyRef.current?.();
        };
    }, []);
}
