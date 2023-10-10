import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { getFirstNavigatableItemSlugInDefinition, PathResolver, type NavigatableDocsNode } from "@fern-ui/app-utils";
import { useBooleanState, useEventCallback } from "@fern-ui/react-commons";
import { debounce } from "lodash-es";
import { useRouter } from "next/router";
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getRouteNode } from "../util/anchor";
import { NavigationContext, type NavigateToPathOpts } from "./NavigationContext";
import { useSlugListeners } from "./useSlugListeners";

export declare namespace NavigationContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        resolvedNavigatable: NavigatableDocsNode;
    }>;
}

export const NavigationContextProvider: React.FC<NavigationContextProvider.Props> = ({
    docsDefinition,
    resolvedNavigatable,
    children,
}) => {
    const router = useRouter();
    const userIsScrolling = useRef(false);
    const justNavigatedTo = useRef<string | undefined>(router.asPath);
    const { value: hasInitialized, setTrue: markAsInitialized } = useBooleanState(false);
    const [activeDocsNode, setActiveDocsNode] = useState(resolvedNavigatable);
    const resolver = useMemo(() => new PathResolver({ docsDefinition }), [docsDefinition]);

    // TODO: Confirm
    const selectedSlug = activeDocsNode.leadingSlug;

    const getFullSlug = useCallback((_: string) => {
        // TODO: Implement
        return "abc";
    }, []);

    const navigateToPath = useEventCallback((slug: string, opts?: NavigateToPathOpts) => {
        justNavigated.current = true;
        // navigateToPathListeners.invokeListeners(slug);
        const timeout = setTimeout(() => {
            justNavigated.current = false;
        }, 500);
        return () => {
            clearTimeout(timeout);
        };
    });

    const navigateToRoute = useRef((route: string, smoothScroll: boolean) => {
        if (!userIsScrolling.current) {
            const node = getRouteNode(route);
            node?.scrollIntoView({ behavior: smoothScroll ? "smooth" : "auto" });
            justNavigatedTo.current = route;
        }
    });

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

    const justNavigated = useRef(false);

    const navigateToPathListeners = useSlugListeners("navigateToPath", { selectedSlug });
    const scrollToPathListeners = useSlugListeners("scrollToPath", { selectedSlug });

    const onScrollToPath = useEventCallback((slugWithoutVersion: string) => {
        const slug = getFullSlug(slugWithoutVersion);
        if (justNavigated.current || slug === selectedSlug) {
            return;
        }
        void router.replace(`/${slug}`, undefined, { shallow: true, scroll: false });
        scrollToPathListeners.invokeListeners(slug);
    });

    useEffect(() => {
        router.beforePopState(({ as }) => {
            const slugCandidate = as.substring(1, as.length);
            const slug = slugCandidate === "" ? getFirstNavigatableItemSlugInDefinition(docsDefinition) : slugCandidate;
            if (slug != null) {
                navigateToPath(slug, { omitTabSlug: true, omitVersionSlug: true });
            }
            return true;
        });
    }, [router, navigateToPath, docsDefinition]);

    return (
        <NavigationContext.Provider
            value={{
                hasInitialized,
                justNavigated: justNavigatedTo.current != null,
                activeNavigatable,
                navigateToPath,
                getFullSlug,
                userIsScrolling: () => userIsScrolling.current,
                onScrollToPath,
                observeDocContent,
                resolver,
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
};
