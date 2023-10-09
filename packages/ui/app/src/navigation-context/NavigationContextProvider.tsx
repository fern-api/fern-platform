import { debounce } from "lodash-es";
import { useRouter } from "next/router";
import { PropsWithChildren, useCallback, useEffect, useRef } from "react";
import { getRouteNode } from "../util/anchor";
import { NavigationContext } from "./NavigationContext";

export declare namespace NavigationContextProvider {}

export const NavigationContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const router = useRouter();
    const userIsScrolling = useRef(false);
    const justNavigatedTo = useRef<string | undefined>(router.asPath);

    const navigateToRoute = useRef((route: string, smoothScroll: boolean) => {
        if (!userIsScrolling.current) {
            const node = getRouteNode(route);
            node?.scrollIntoView({ behavior: smoothScroll ? "smooth" : "auto" });
            justNavigatedTo.current = route;
        }
    });

    // on mount, scroll directly to routed element
    useEffect(() => {
        navigateToRoute.current(router.asPath, false);
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
        if (element != null) {
            resizeObserver.current?.disconnect();
            resizeObserver.current = new window.ResizeObserver(() => {
                if (justNavigatedTo.current != null) {
                    navigateToRoute.current(justNavigatedTo.current, false);
                }
            });
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
                justNavigated: justNavigatedTo.current != null,
                userIsScrolling: () => userIsScrolling.current,
                observeDocContent,
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
};
