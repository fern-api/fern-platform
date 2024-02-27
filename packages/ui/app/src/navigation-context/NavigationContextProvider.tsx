import { useBooleanState, useEventCallback } from "@fern-ui/react-commons";
import { debounce } from "lodash-es";
import Head from "next/head";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
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

export const NavigationContextProvider: React.FC<NavigationContextProvider.Props> = ({
    resolvedPath,
    children,
    basePath,
    navigation,
}) => {
    const router = useRouter();
    const userIsScrolling = useRef(false);
    const resolvedRoute = getRouteForResolvedPath({
        resolvedSlug: resolvedPath.fullSlug,
        asPath: router.asPath, // do not include basepath because it is already included
    });
    const justNavigatedTo = useRef<string | undefined>(resolvedRoute);

    const [activeNavigatable, setActiveNavigatable] = useState(() =>
        resolveActiveSidebarNode(navigation.sidebarNodes, resolvedPath.fullSlug.split("/")),
    );

    const selectedSlug = activeNavigatable?.slug.join("/") ?? "";

    const navigateToRoute = useRef((route: string, _disableSmooth = false) => {
        const [routeWithoutAnchor, anchor] = route.split("#");
        if (!userIsScrolling.current && routeWithoutAnchor != null) {
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
        justNavigatedTo.current = route;
    });

    // on mount, scroll directly to routed element
    useEffect(() => {
        const handleInit = () => {
            navigateToRoute.current(resolvedRoute);
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
                userIsScrolling.current = false;
            },
            300,
            { leading: false, trailing: true },
        ),
    );

    const resizeObserver = useRef<ResizeObserver>();

    useEffect(() => {
        const handleNavigate = () => {
            if (justNavigatedTo.current != null) {
                navigateToRoute.current(justNavigatedTo.current, true);
            }
        };

        handleNavigate();
        resizeObserver.current = new window.ResizeObserver(handleNavigate);
        resizeObserver.current.observe(document.body);

        return () => {
            resizeObserver.current?.disconnect();
        };
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
        setActiveNavigatable(resolveActiveSidebarNode(navigation.sidebarNodes, fullSlug.split("/")));

        void router.replace(`/${fullSlug}`, undefined, { shallow: true, scroll: false });
        scrollToPathListeners.invokeListeners(fullSlug);
    });

    const timeout = useRef<NodeJS.Timeout>();

    const navigateToPath = useEventCallback((route: string, shallow = false) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const fullSlug = route.substring(1).split("#")[0]!;
        justNavigated.current = true;
        navigateToRoute.current(route, !shallow);
        setActiveNavigatable(resolveActiveSidebarNode(navigation.sidebarNodes, fullSlug.split("/")));
        // navigateToPathListeners.invokeListeners(slug);
        timeout.current != null && clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            justNavigated.current = false;
        }, 500);
    });

    const closeMobileSidebar = useCloseMobileSidebar();
    const closeSearchDialog = useCloseSearchDialog();

    useEffect(() => {
        const handleRouteChangeStart = (route: string, { shallow }: { shallow: boolean }) => {
            navigateToPath(route, shallow);
            closeMobileSidebar();
            closeSearchDialog();
        };
        router.events.on("routeChangeComplete", handleRouteChangeStart);
        router.events.on("hashChangeComplete", handleRouteChangeStart);
        return () => {
            router.events.off("routeChangeComplete", handleRouteChangeStart);
            router.events.off("hashChangeComplete", handleRouteChangeStart);
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
            }
            return true;
        });
    }, [router, navigateToPath, basePath, navigation.sidebarNodes]);

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
