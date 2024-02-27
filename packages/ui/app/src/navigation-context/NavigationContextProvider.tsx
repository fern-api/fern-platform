import { useBooleanState, useEventCallback } from "@fern-ui/react-commons";
import { debounce } from "lodash-es";
import Head from "next/head";
import { useRouter } from "next/router";
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { useCloseMobileSidebar, useCloseSearchDialog } from "../sidebar/atom";
import { resolveActiveSidebarNode, SidebarNavigation, SidebarNode } from "../sidebar/types";
import { getRouteAndAnchorNode } from "../util/anchor";
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

let userHasScrolled = false;
let userIsScrolling = false;
let resizeObserver: ResizeObserver | undefined;
let preventScrollToPath = false;
let preventScrollToPathTimeout: number | undefined;

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
        resolveActiveSidebarNode(navigation.sidebarNodes, resolvedPath.fullSlug.split("/")),
    );

    const selectedSlug = activeNavigatable?.slug.join("/") ?? "";

    const navigateToRoute = useCallback(
        (route: string, _disableSmooth = false) => {
            // eslint-disable-next-line no-console
            console.log("navigateToRoute", route);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const fullSlug = route.substring(1).split("#")[0]!;
            const navigatable = resolveActiveSidebarNode(navigation.sidebarNodes, fullSlug.split("/"));
            if (navigatable != null) {
                setActiveNavigatable(navigatable);
            }

            const node = getRouteAndAnchorNode(route);

            if (node == null) {
                if (!userIsScrolling) {
                    window.scrollTo(0, 0);
                }
                return;
            }

            function observe(node: HTMLElement) {
                let currentTop = node.getBoundingClientRect().top + document.documentElement.scrollTop;
                const handleNavigate = () => {
                    const lastTop = currentTop;
                    const newTop = node.getBoundingClientRect().top + document.documentElement.scrollTop;
                    currentTop = newTop;

                    if (!userHasScrolled) {
                        node.scrollIntoView({ behavior: "auto" });
                        return;
                    }

                    if (lastTop !== newTop && !userIsScrolling) {
                        const offset = window.scrollY - lastTop;
                        preventScrollToPath = true;
                        clearTimeout(preventScrollToPathTimeout);
                        preventScrollToPathTimeout = window.setTimeout(() => {
                            preventScrollToPath = false;
                        }, 500);

                        window.scrollTo(0, newTop + offset);
                    }
                };
                resizeObserver?.disconnect();
                resizeObserver = new window.ResizeObserver(handleNavigate);
                resizeObserver.observe(document.body);
            }

            if (!userIsScrolling) {
                node.scrollIntoView({ behavior: "auto" });
                userHasScrolled = false;
            }
            observe(node);
        },
        [navigation.sidebarNodes],
    );

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

    const setUserIsScrollingFalse = useRef(
        debounce(
            () => {
                userIsScrolling = false;
            },
            50,
            { leading: false, trailing: true },
        ),
    );

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const handleScroll = () => {
            userIsScrolling = true;
            userHasScrolled = true;
            setUserIsScrollingFalse.current();
        };
        window.addEventListener("wheel", handleScroll);
        window.addEventListener("touchmove", handleScroll);

        return () => {
            window.removeEventListener("wheel", handleScroll);
            window.removeEventListener("touchmove", handleScroll);
        };
    }, []);

    // const navigateToPathListeners = useSlugListeners("navigateToPath", { selectedSlug });
    const scrollToPathListeners = useSlugListeners("scrollToPath", { selectedSlug });

    const onScrollToPath = useEventCallback(
        debounce(
            (fullSlug: string) => {
                if (fullSlug === selectedSlug || preventScrollToPath) {
                    return;
                }
                // eslint-disable-next-line no-console
                console.log("onScrollToPath", fullSlug);
                void router.replace(`/${fullSlug}`, undefined, { shallow: true, scroll: false });
                scrollToPathListeners.invokeListeners(fullSlug);
            },
            100,
            { leading: false, trailing: true },
        ),
    );

    const closeMobileSidebar = useCloseMobileSidebar();
    const closeSearchDialog = useCloseSearchDialog();

    useEffect(() => {
        const handleRouteChangeComplete = (route: string, { shallow }: { shallow: boolean }) => {
            navigateToRoute(route, !shallow);
            closeMobileSidebar();
            closeSearchDialog();
        };
        const handleRouteChangeError = (e: unknown, route: string, options: { shallow: boolean }) => {
            if (process.env.NODE_ENV !== "production") {
                // eslint-disable-next-line no-console
                console.error("Error navigating to...", route, options);
                // eslint-disable-next-line no-console
                console.error(e);
            }
        };
        router.events.on("routeChangeError", handleRouteChangeError);
        router.events.on("routeChangeComplete", handleRouteChangeComplete);
        router.events.on("hashChangeComplete", handleRouteChangeComplete);
        return () => {
            router.events.off("routeChangeError", handleRouteChangeError);
            router.events.off("routeChangeComplete", handleRouteChangeComplete);
            router.events.off("hashChangeComplete", handleRouteChangeComplete);
        };
    }, [closeMobileSidebar, closeSearchDialog, navigateToRoute, router.events]);

    useEffect(() => {
        router.beforePopState(({ as }) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const slugCandidate = as.substring(1).split("#")[0]!;
            const previousNavigatable = resolveActiveSidebarNode(navigation.sidebarNodes, slugCandidate.split("/"));
            if (previousNavigatable != null) {
                const fullSlug = previousNavigatable.slug.join("/");
                navigateToRoute(`/${fullSlug}`);
            }
            return true;
        });
    }, [router, basePath, navigation, navigateToRoute]);

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
                activeVersion: navigation.versions[navigation.currentVersionIndex ?? 0],
                selectedSlug,
                activeNavigatable,
                onScrollToPath,
                registerScrolledToPathListener: scrollToPathListeners.registerListener,
                resolvedPath,
                hydrated: hydrated.value,
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
