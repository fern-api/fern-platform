import { Router } from "next/router";
import { useEffect } from "react";

export function useRouteChanged(callback: () => void): void {
    useEffect(() => {
        Router.events.on("routeChangeComplete", callback);
        Router.events.on("routeChangeError", callback);
        Router.events.on("hashChangeComplete", callback);
        return () => {
            Router.events.off("routeChangeComplete", callback);
            Router.events.off("routeChangeError", callback);
            Router.events.off("hashChangeComplete", callback);
        };
    }, [callback]);
}
