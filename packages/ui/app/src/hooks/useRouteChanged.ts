import { Router } from "next/router";
import { useEffect } from "react";

export function useRouteChanged(callback: (route: string, shallow?: boolean) => void): void {
    useEffect(() => {
        const handleRouteChange = (route: string, { shallow }: { shallow?: boolean }) => {
            callback(route, shallow);
        };
        const handleRouteChangeError = (_err: Error, route: string, { shallow }: { shallow?: boolean }) => {
            callback(route, shallow);
        };
        const handleHashChangeComplete = (route: string) => {
            callback(route, true);
        };
        Router.events.on("routeChangeComplete", handleRouteChange);
        Router.events.on("routeChangeError", handleRouteChangeError);
        Router.events.on("hashChangeComplete", handleHashChangeComplete);
        return () => {
            Router.events.off("routeChangeComplete", handleRouteChange);
            Router.events.off("routeChangeError", handleRouteChangeError);
            Router.events.off("hashChangeComplete", handleHashChangeComplete);
        };
    }, [callback]);
}
