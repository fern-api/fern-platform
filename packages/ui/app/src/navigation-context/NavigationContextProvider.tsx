import { useBooleanState, useEventCallback } from "@fern-ui/react-commons";
import Head from "next/head";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect, useState } from "react";
import { useCloseMobileSidebar, useCloseSearchDialog } from "../sidebar/atom";
import { resolveActiveSidebarNode, SidebarNavigation, SidebarNode } from "../sidebar/types";
import { getRouteNode } from "../util/anchor";
import { FernDocsFrontmatter } from "../util/mdx";
import { ResolvedPath } from "../util/ResolvedPath";
import { getRouteForResolvedPath } from "./getRouteForResolvedPath";
import { NavigationContext } from "./NavigationContext";
import { useSlugListeners } from "./useSlugListeners";

export declare namespace NavigationContextProvider {
    export type Props = PropsWithChildren<{
        resolvedPath: ResolvedPath;
        basePath: string | undefined;
        navigation: SidebarNavigation;
    }>;
}

let userIsScrolling = false;
let userIsScrollingTimeout: number;
let justNavigatedTo: string | undefined;
let scrollToPathTimeout: number;

function navigateToRoute(route: string, _disableSmooth = false) {
    const [routeWithoutAnchor, anchor] = route.split("#");
    if (!userIsScrolling && routeWithoutAnchor != null) {
        // fallback to "routeWithoutAnchor" if anchor is not detected (otherwise API reference will scroll to top)
        const node =
            getRouteNode(route) ??
            getRouteNode(routeWithoutAnchor) ??
            (anchor != null ? document.getElementById(anchor) : undefined);
        node?.scrollIntoView({
            behavior: "auto",
        });

        // on mobile, the scrollToTop is not working, so we need to force it
        if (node == null) {
            window.scrollTo(0, 0);
        }
    }
    justNavigatedTo = route;
}

export const NavigationContextProvider: React.FC<NavigationContextProvider.Props> = ({
    resolvedPath,
    children,
    basePath,
    navigation,
}) => {
    const router = useRouter();
    const resolvedRoute = getRouteForResolvedPath({
        resolvedSlug: resolvedPath.fullSlug,
        asPath: router.asPath, // do not include basepath because it is already included
    });

    const [activeNavigatable, setActiveNavigatable] = useState(() =>
        resolveActiveSidebarNode(
            navigation.sidebarNodes,
            resolvedPath.fullSlug.split("/").filter((str) => str.trim().length > 0),
        ),
    );

    const selectedSlug = activeNavigatable?.slug.join("/") ?? "";

    // on mount, scroll directly to routed element
    useEffect(() => {
        const handleInit = () => {
            navigateToRoute(resolvedRoute);
        };
        handleInit();
        window.addEventListener("DOMContentLoaded", handleInit);
        return () => {
            window.removeEventListener("DOMContentLoaded", handleInit);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleNavigate = () => {
            if (justNavigatedTo != null) {
                navigateToRoute(justNavigatedTo, true);
            }
        };

        handleNavigate();
        const resizeObserver = new window.ResizeObserver(handleNavigate);
        resizeObserver.observe(document.body);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const handleUserTriggeredScroll = () => {
            userIsScrolling = true;
            justNavigatedTo = undefined;
            clearTimeout(userIsScrollingTimeout);
            userIsScrollingTimeout = window.setTimeout(() => {
                userIsScrolling = false;
            }, 150); // reaction time
        };

        const handleScroll = () => {
            if (userIsScrolling) {
                clearTimeout(userIsScrollingTimeout);
                userIsScrollingTimeout = window.setTimeout(() => {
                    userIsScrolling = false;
                }, 150); // reaction time
            }
        };

        window.addEventListener("wheel", handleUserTriggeredScroll);
        window.addEventListener("touchmove", handleUserTriggeredScroll);
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("wheel", handleUserTriggeredScroll);
            window.removeEventListener("touchmove", handleUserTriggeredScroll);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // const navigateToPathListeners = useSlugListeners("navigateToPath", { selectedSlug });
    const scrollToPathListeners = useSlugListeners("scrollToPath", { selectedSlug });

    const onScrollToPath = useEventCallback((fullSlug: string) => {
        if (fullSlug === selectedSlug) {
            return;
        }
        justNavigatedTo = undefined;
        userIsScrolling = true;
        clearTimeout(scrollToPathTimeout);
        scrollToPathTimeout = window.setTimeout(() => {
            void router.replace(`/${fullSlug}`, undefined, { shallow: true, scroll: false });
            setActiveNavigatable(resolveActiveSidebarNode(navigation.sidebarNodes, fullSlug.split("/")));
            scrollToPathListeners.invokeListeners(fullSlug);
            userIsScrolling = false;
        }, 150);
    });

    const navigateToPath = useEventCallback((route: string, shallow = false) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const fullSlug = route.substring(1).split("#")[0]!;
        navigateToRoute(route, !shallow);
        setActiveNavigatable(resolveActiveSidebarNode(navigation.sidebarNodes, fullSlug.split("/")));
    });

    const closeMobileSidebar = useCloseMobileSidebar();
    const closeSearchDialog = useCloseSearchDialog();

    useEffect(() => {
        const handleRouteChange = (route: string, { shallow }: { shallow: boolean }) => {
            navigateToPath(route, shallow);
            closeMobileSidebar();
            closeSearchDialog();
        };
        const handleRouteChangeError = (err: Error, route: string, options: { shallow: boolean }) => {
            if (process.env.NODE_ENV === "development") {
                // eslint-disable-next-line no-console
                console.error(err);
                // eslint-disable-next-line no-console
                console.error("Failed to navigate to route", route, options);
            }

            handleRouteChange(route, options);
        };
        router.events.on("routeChangeComplete", handleRouteChange);
        router.events.on("hashChangeComplete", handleRouteChange);
        router.events.on("routeChangeError", handleRouteChangeError);
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange);
            router.events.off("hashChangeComplete", handleRouteChange);
            router.events.off("routeChangeError", handleRouteChangeError);
        };
    }, [closeMobileSidebar, closeSearchDialog, navigateToPath, router.events]);

    useEffect(() => {
        router.beforePopState(({ as }) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const slugCandidate = as.substring(1).split("#")[0]!;
            const previousNavigatable = resolveActiveSidebarNode(navigation.sidebarNodes, slugCandidate.split("/"));
            if (previousNavigatable != null) {
                const fullSlug = previousNavigatable.slug.join("/");
                navigateToPath(`/${fullSlug}`);
                closeMobileSidebar();
                closeSearchDialog();
            }
            return true;
        });
    }, [router, navigateToPath, basePath, navigation.sidebarNodes, closeMobileSidebar, closeSearchDialog]);

    const hydrated = useBooleanState(false);
    useEffect(() => {
        hydrated.setTrue();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const frontmatter = getFrontmatter(resolvedPath);
    const activeTitle = convertToTitle(activeNavigatable, frontmatter);
    const activeDescription = convertToDescription(activeNavigatable, frontmatter);

    return (
        <NavigationContext.Provider
            value={{
                basePath,
                activeNavigatable,
                onScrollToPath,
                registerScrolledToPathListener: scrollToPathListeners.registerListener,
                resolvedPath,
                hydrated: hydrated.value,
                activeVersion: navigation.versions[navigation.currentVersionIndex ?? 0],
                selectedSlug,
                navigation,
            }}
        >
            <Head>
                {activeTitle != null && <title>{activeTitle}</title>}
                {activeDescription != null && <meta name="description" content={activeDescription} />}
                {frontmatter?.image != null && <meta property="og:image" content={frontmatter.image} />}
            </Head>
            {children}
        </NavigationContext.Provider>
    );
};

function getFrontmatter(resolvedPath: ResolvedPath): FernDocsFrontmatter | undefined {
    if (resolvedPath.type === "custom-markdown-page") {
        return resolvedPath.serializedMdxContent.frontmatter;
    }
    return undefined;
}

function convertToTitle(
    page: SidebarNode.Page | undefined,
    frontmatter: FernDocsFrontmatter | undefined,
): string | undefined {
    return frontmatter?.title ?? page?.title;
}

function convertToDescription(
    page: SidebarNode.Page | undefined,
    frontmatter: FernDocsFrontmatter | undefined,
): string | undefined {
    return frontmatter?.description ?? page?.description ?? undefined;
}
