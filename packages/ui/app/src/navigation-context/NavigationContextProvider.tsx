import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { getFullSlugForNavigatable, PathResolver } from "@fern-ui/app-utils";
import { useBooleanState, useEventCallback } from "@fern-ui/react-commons";
import { debounce } from "lodash-es";
import { useRouter } from "next/router";
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type ResolvedPath } from "../ResolvedPath";
import { getRouteNode } from "../util/anchor";
import { getRouteForResolvedPath } from "./getRouteForResolvedPath";
import { NavigationContext } from "./NavigationContext";
import { useSlugListeners } from "./useSlugListeners";

export declare namespace NavigationContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        resolvedPath: ResolvedPath;
    }>;
}

export const NavigationContextProvider: React.FC<NavigationContextProvider.Props> = ({
    docsDefinition,
    resolvedPath,
    children,
}) => {
    const router = useRouter();
    const userIsScrolling = useRef(false);
    const resolvedRoute = getRouteForResolvedPath({ resolvedSlug: resolvedPath.fullSlug, asPath: router.asPath });
    const justNavigatedTo = useRef<string | undefined>(resolvedRoute);
    const { value: hasInitialized, setTrue: markAsInitialized } = useBooleanState(false);
    const resolver = useMemo(() => new PathResolver({ docsDefinition }), [docsDefinition]);

    const resolvedNavigatable = useMemo(() => {
        const node = resolver.resolveNavigatable(resolvedPath.fullSlug);
        if (node == null) {
            throw new Error(
                `Implementation Error. Cannot resolve navigatable for resolved path ${resolvedPath.fullSlug}`
            );
        }
        return node;
    }, [resolver, resolvedPath]);

    useEffect(() => {
        setActiveNavigatable(resolvedNavigatable);
        if (resolvedNavigatable?.type === "page") {
            window.scrollTo({ top: 0 });
        }
    }, [resolvedNavigatable]);

    const [activeNavigatable, setActiveNavigatable] = useState(resolvedNavigatable);

    const activeNavigatableNeighbors = useMemo(() => {
        return resolver.getNeighborsForNavigatable(activeNavigatable);
    }, [resolver, activeNavigatable]);

    const selectedSlug = getFullSlugForNavigatable(activeNavigatable, { omitDefault: true });

    const navigateToRoute = useRef((route: string) => {
        if (!userIsScrolling.current) {
            const node = getRouteNode(route);
            node?.scrollIntoView();
            justNavigatedTo.current = route;
        }
    });

    // on mount, scroll directly to routed element
    useEffect(() => {
        const handleInit = () => {
            navigateToRoute.current(resolvedRoute);
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
        const handleRouteChangeStart = (route: string) => {
            navigateToRoute.current(route);
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
                navigateToRoute.current(justNavigatedTo.current);
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

    const justNavigated = useRef(false);

    // const navigateToPathListeners = useSlugListeners("navigateToPath", { selectedSlug });
    const scrollToPathListeners = useSlugListeners("scrollToPath", { selectedSlug });

    const onScrollToPath = useEventCallback((fullSlug: string) => {
        if (justNavigated.current || fullSlug === selectedSlug) {
            return;
        }
        const navigatable = resolver.resolveNavigatable(fullSlug);
        if (navigatable != null) {
            setActiveNavigatable(navigatable);
        }
        void router.replace(`/${fullSlug}`, undefined, { shallow: true, scroll: false });
        scrollToPathListeners.invokeListeners(fullSlug);
    });

    const navigateToPath = useEventCallback((fullSlug: string) => {
        justNavigated.current = true;
        const navigatable = resolver.resolveNavigatable(fullSlug);
        if (navigatable != null) {
            setActiveNavigatable(navigatable);
        }
        // navigateToPathListeners.invokeListeners(slug);
        const timeout = setTimeout(() => {
            justNavigated.current = false;
        }, 500);
        return () => {
            clearTimeout(timeout);
        };
    });

    useEffect(() => {
        router.beforePopState(({ as }) => {
            const slugCandidate = as.substring(1, as.length);
            const previousNavigatable = resolver.resolveNavigatable(slugCandidate);
            if (previousNavigatable != null) {
                const fullSlug = getFullSlugForNavigatable(previousNavigatable);
                navigateToPath(fullSlug);
            }
            return true;
        });
    }, [router, navigateToPath, docsDefinition, resolver]);

    return (
        <NavigationContext.Provider
            value={{
                hasInitialized,
                justNavigated: justNavigatedTo.current != null,
                activeNavigatable,
                navigateToPath,
                userIsScrolling: () => userIsScrolling.current,
                onScrollToPath,
                observeDocContent,
                resolver,
                registerScrolledToPathListener: scrollToPathListeners.registerListener,
                activeNavigatableNeighbors,
                resolvedPath,
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
};
