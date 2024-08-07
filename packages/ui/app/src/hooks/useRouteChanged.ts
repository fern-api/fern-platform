import { Router } from "next/router";
import { useEffect } from "react";

export function useRouteChanged(callback: (route: string) => void): void {
    useEffect(() => {
        const handleRouteChange = (route: string) => {
            callback(route);
        };
        const handleRouteChangeError = (_err: Error, route: string) => {
            callback(route);
        };
        Router.events.on("routeChangeComplete", handleRouteChange);
        Router.events.on("routeChangeError", handleRouteChangeError);
        Router.events.on("hashChangeComplete", handleRouteChange);
        return () => {
            Router.events.off("routeChangeComplete", handleRouteChange);
            Router.events.off("routeChangeError", handleRouteChangeError);
            Router.events.off("hashChangeComplete", handleRouteChange);
        };
    }, [callback]);
}
