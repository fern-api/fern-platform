import { useBooleanState, useEventCallback } from "@fern-ui/react-commons";
import { debounce } from "lodash-es";
import Head from "next/head";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect, useState } from "react";
import { useCloseMobileSidebar, useCloseSearchDialog } from "../sidebar/atom";
import { resolveActiveSidebarNode, SidebarNavigation, SidebarNode } from "../sidebar/types";
import { getRouteNodeWithAnchor } from "../util/anchor";
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
let justNavigatedTo: string | undefined;

const setUserIsNotScrolling = debounce(
    () => {
        userIsScrolling = false;
    },
    250,
    { leading: false, trailing: true },
);

function navigateToRoute(route: string) {
    if (!userIsScrolling) {
        // fallback to "routeWithoutAnchor" if anchor is not detected (otherwise API reference will scroll to top)
        const { node } = getRouteNodeWithAnchor(route);
        node?.scrollIntoView({
            behavior: "auto",
        });

        // on mobile, the scrollToTop is not working, so we need to force it
        if (node == null) {
            window.scrollTo(0, 0);
        }
    }
}
let raf: number;

export const NavigationContextProvider: React.FC<NavigationContextProvider.Props> = ({
    resolvedPath,
    children,
    basePath,
    navigation,
}) => {
    const router = useRouter();

    const [activeNavigatable, setActiveNavigatable] = useState(() =>
        resolveActiveSidebarNode(
            navigation.sidebarNodes,
            resolvedPath.fullSlug.split("/").filter((str) => str.trim().length > 0),
        ),
    );

    const selectedSlug = activeNavigatable?.slug.join("/") ?? "";
    const resolvedRoute = getRouteForResolvedPath({
        resolvedSlug: selectedSlug,
        asPath: router.asPath, // do not include basepath because it is already included
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => navigateToRoute(resolvedRoute), []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        let lastActiveNavigatableOffsetTop: number | undefined;
        let lastScrollY: number | undefined;
        function step() {
            // const [route, anchor] = resolvedRoute.split("#");
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { node } = getRouteNodeWithAnchor(resolvedRoute);
            if (node != null) {
                if (lastActiveNavigatableOffsetTop == null && resolvedRoute === justNavigatedTo && !userIsScrolling) {
                    node.scrollIntoView({ behavior: "auto" });
                }
                const currentActiveNavigatableOffsetTop =
                    node.getBoundingClientRect().top + document.documentElement.scrollTop;
                if (lastActiveNavigatableOffsetTop == null || lastScrollY == null) {
                    lastActiveNavigatableOffsetTop = currentActiveNavigatableOffsetTop;
                    lastScrollY = window.scrollY;
                } else {
                    if (lastActiveNavigatableOffsetTop !== currentActiveNavigatableOffsetTop) {
                        const diff = lastActiveNavigatableOffsetTop - currentActiveNavigatableOffsetTop;
                        const newScrollY = lastScrollY - diff;
                        if (!userIsScrolling) {
                            window.scrollTo(0, newScrollY);
                        }
                        lastActiveNavigatableOffsetTop = currentActiveNavigatableOffsetTop;
                        lastScrollY = newScrollY;
                    } else {
                        lastActiveNavigatableOffsetTop = currentActiveNavigatableOffsetTop;
                        lastScrollY = window.scrollY;
                    }
                }
            }
            raf = window.requestAnimationFrame(step);
        }

        raf = window.requestAnimationFrame(step);
        return () => {
            window.cancelAnimationFrame(raf);
        };
    }, [resolvedRoute]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const handleUserTriggeredScroll = () => {
            userIsScrolling = true;
            setUserIsNotScrolling();
            justNavigatedTo = undefined;
        };

        const handleScroll = () => {
            setUserIsNotScrolling();
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

    const onScrollToPath = useEventCallback(
        debounce(
            (fullSlug: string) => {
                if (fullSlug === selectedSlug || justNavigatedTo != null) {
                    return;
                }
                void router.replace(`/${fullSlug}`, undefined, { shallow: true, scroll: false });
                scrollToPathListeners.invokeListeners(fullSlug);
            },
            50,
            { trailing: true },
        ),
    );

    const navigateToPath = useEventCallback((route: string) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const fullSlug = route.substring(1).split("#")[0]!;
        window.cancelAnimationFrame(raf);
        setActiveNavigatable(resolveActiveSidebarNode(navigation.sidebarNodes, fullSlug.split("/")));
        justNavigatedTo = route;
        navigateToRoute(route);
    });

    const closeMobileSidebar = useCloseMobileSidebar();
    const closeSearchDialog = useCloseSearchDialog();

    const { value: hydrated, setTrue: hydrate } = useBooleanState(false);
    useEffect(() => {
        hydrate();
    }, [hydrate, selectedSlug]);

    useEffect(() => {
        const handleRouteChange = (route: string) => {
            navigateToPath(route);
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

            handleRouteChange(route);
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
                hydrated,
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
