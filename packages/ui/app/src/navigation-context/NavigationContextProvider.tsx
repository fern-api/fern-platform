import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { PathResolver } from "@fern-ui/app-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { debounce } from "lodash-es";
import { useRouter } from "next/router";
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef } from "react";
import { getRouteNode } from "../util/anchor";
import { NavigationContext } from "./NavigationContext";

export declare namespace NavigationContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
    }>;
}

export const NavigationContextProvider: React.FC<NavigationContextProvider.Props> = ({ docsDefinition, children }) => {
    const router = useRouter();
    const userIsScrolling = useRef(false);
    const justNavigatedTo = useRef<string | undefined>(router.asPath);
    const { value: hasInitialized, setTrue: markAsInitialized } = useBooleanState(false);

    const navigateToRoute = useRef((route: string, smoothScroll: boolean) => {
        if (!userIsScrolling.current) {
            const node = getRouteNode(route);
            node?.scrollIntoView({ behavior: smoothScroll ? "smooth" : "auto" });
            justNavigatedTo.current = route;
        }
    });

    const resolver = useMemo(() => new PathResolver({ docsDefinition }), [docsDefinition]);

    // on mount, scroll directly to routed element
    useEffect(() => {
        const handleInit = () => {
            navigateToRoute.current(router.asPath, false);
        };
        handleInit();
        markAsInitialized();
        window.addEventListener("DOMContentLoaded", handleInit);
        return () => {
            window.removeEventListener("DOMContentLoaded", handleInit);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleRouteChangeStart = (route: string, { shallow }: { shallow: boolean }) => {
            navigateToRoute.current(route, shallow);
        };
        router.events.on("routeChangeStart", handleRouteChangeStart);
        router.events.on("hashChangeStart", handleRouteChangeStart);
        router.events.on("routeChangeComplete", handleRouteChangeStart);
        router.events.on("hashChangeComplete", handleRouteChangeStart);
        return () => {
            router.events.off("routeChangeStart", handleRouteChangeStart);
            router.events.off("hashChangeStart", handleRouteChangeStart);
            router.events.off("routeChangeComplete", handleRouteChangeStart);
            router.events.off("hashChangeComplete", handleRouteChangeStart);
        };
    }, [navigateToRoute, router.events]);

    const setUserIsScrollingFalse = useRef(
        debounce(() => (userIsScrolling.current = false), 100, { leading: false, trailing: true })
    );

    const resizeObserver = useRef<ResizeObserver>();

    const observeDocContent = useCallback((element: HTMLDivElement) => {
        const handleNavigate = () => {
            if (justNavigatedTo.current != null) {
                navigateToRoute.current(justNavigatedTo.current, false);
            }
        };
        if (element != null) {
            resizeObserver.current?.disconnect();
            handleNavigate();
            resizeObserver.current = new window.ResizeObserver(handleNavigate);
            resizeObserver.current.observe(element);
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const handleScroll = () => {
            userIsScrolling.current = true;
            setUserIsScrollingFalse.current();
            justNavigatedTo.current = undefined;
        };
        window.addEventListener("wheel", handleScroll);
        window.addEventListener("touchmove", handleScroll);

        return () => {
            window.removeEventListener("wheel", handleScroll);
            window.removeEventListener("touchmove", handleScroll);
        };
    }, []);

    return (
        <NavigationContext.Provider
            value={{
                hasInitialized,
                justNavigated: justNavigatedTo.current != null,
                userIsScrolling: () => userIsScrolling.current,
                observeDocContent,
                resolver,
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
};
