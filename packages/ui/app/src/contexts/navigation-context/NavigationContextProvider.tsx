import { SidebarNode, traverseSidebarNodes } from "@fern-ui/fdr-utils";
import { useEventCallback } from "@fern-ui/react-commons";
import { debounce, memoize } from "lodash-es";
import Head from "next/head";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect, useState } from "react";
import { renderToString } from "react-dom/server";
import { emitDatadogError } from "../../analytics/datadogRum";
import { MdxContent } from "../../mdx/MdxContent";
import { FernDocsFrontmatter } from "../../mdx/mdx";
import { useCloseMobileSidebar, useCloseSearchDialog } from "../../sidebar/atom";
import { ResolvedPath } from "../../util/ResolvedPath";
import { getRouteNodeWithAnchor } from "../../util/anchor";
import { useFeatureFlags } from "../FeatureFlagContext";
import { useDocsContext } from "../docs-context/useDocsContext";
import { NavigationContext } from "./NavigationContext";
import { useSlugListeners } from "./useSlugListeners";

export declare namespace NavigationContextProvider {
    export type Props = PropsWithChildren<{
        resolvedPath: ResolvedPath;
        domain: string;
        basePath: string | undefined;
        title: string | undefined;
    }>;
}

let userHasScrolled = false;
let userIsScrolling = false;
let justNavigatedTo: string | undefined;
let justScrolledTo: string | undefined;

const setUserIsNotScrolling = debounce(
    () => {
        userIsScrolling = false;
    },
    250,
    { leading: false, trailing: true },
);

let resizeObserver: ResizeObserver | undefined;
let lastScrollY: number | undefined;

function startScrollTracking(route: string, scrolledHere: boolean = false) {
    if (!userIsScrolling && !scrolledHere) {
        getRouteNodeWithAnchor(route)?.node?.scrollIntoView({ behavior: "auto" });
    }
    userHasScrolled = scrolledHere;
    let lastActiveNavigatableOffsetTop: number | undefined;
    lastScrollY = window.scrollY;
    function handleObservation() {
        const { node } = getRouteNodeWithAnchor(route);
        if (node != null) {
            if (lastActiveNavigatableOffsetTop == null && !userHasScrolled) {
                node.scrollIntoView({ behavior: "auto" });
            }
            const currentActiveNavigatableOffsetTop =
                node.getBoundingClientRect().top + document.documentElement.scrollTop;
            if (lastActiveNavigatableOffsetTop == null || lastScrollY == null) {
                lastActiveNavigatableOffsetTop = currentActiveNavigatableOffsetTop;
            } else {
                if (lastActiveNavigatableOffsetTop !== currentActiveNavigatableOffsetTop) {
                    const diff = lastActiveNavigatableOffsetTop - currentActiveNavigatableOffsetTop;
                    const newScrollY = lastScrollY - diff;
                    if (!userHasScrolled) {
                        node.scrollIntoView({ behavior: "auto" });
                    } else {
                        window.scrollTo(0, newScrollY);
                        lastScrollY = newScrollY;
                    }
                    lastActiveNavigatableOffsetTop = currentActiveNavigatableOffsetTop;
                } else {
                    lastActiveNavigatableOffsetTop = currentActiveNavigatableOffsetTop;
                }
            }
        }
    }
    if (justNavigatedTo !== route) {
        justNavigatedTo = route;
        if (resizeObserver != null) {
            resizeObserver.disconnect();
        }
        resizeObserver = new ResizeObserver(handleObservation);
        resizeObserver.observe(document.body);
    }
}

export const NavigationContextProvider: React.FC<NavigationContextProvider.Props> = ({
    resolvedPath,
    children,
    domain,
    basePath,
    title,
}) => {
    const { sidebarNodes, versions, currentVersionIndex } = useDocsContext();
    const { isApiScrollingDisabled } = useFeatureFlags();
    const router = useRouter();

    const [activeNavigatable, setActiveNavigatable] = useState(() =>
        resolveActiveSidebarNode(
            sidebarNodes,
            resolvedPath.fullSlug.split("/").filter((str) => str.trim().length > 0),
        ),
    );

    const [, anchor] = resolvedPath.fullSlug.split("#");
    const selectedSlug = activeNavigatable?.slug.join("/") ?? "";
    const resolvedRoute = `/${selectedSlug}${anchor != null ? `#${anchor}` : ""}`;

    useEffect(() => {
        startScrollTracking(resolvedRoute);
        return () => {
            if (resizeObserver != null) {
                resizeObserver.disconnect();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const handleUserTriggeredScroll = () => {
            lastScrollY = window.scrollY;
            userHasScrolled = true;
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
                if (fullSlug === selectedSlug || justNavigatedTo != null || isApiScrollingDisabled) {
                    return;
                }
                justScrolledTo = `/${fullSlug}`;
                void router.replace(`/${fullSlug}`, undefined, { shallow: true, scroll: false });
                scrollToPathListeners.invokeListeners(fullSlug);
                setActiveNavigatable(resolveActiveSidebarNode(sidebarNodes, fullSlug.split("/")));
                startScrollTracking(`/${fullSlug}`, true);
            },
            300,
            { trailing: true },
        ),
    );

    const navigateToPath = useEventCallback((route: string) => {
        if (route === resolvedRoute || justNavigatedTo === route || justScrolledTo === route) {
            return;
        }
        justScrolledTo = undefined;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const fullSlug = route.substring(1).split("#")[0]!;
        setActiveNavigatable(resolveActiveSidebarNode(sidebarNodes, decodeURI(fullSlug).split("/")));
        startScrollTracking(route);
    });

    const closeMobileSidebar = useCloseMobileSidebar();
    const closeSearchDialog = useCloseSearchDialog();

    useEffect(() => {
        const handleRouteChange = (route: string, options: { shallow: boolean }) => {
            if (!options.shallow) {
                userIsScrolling = false;
                userHasScrolled = false;
            }
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

            handleRouteChange(route, options);
        };
        router.events.on("routeChangeComplete", handleRouteChange);
        router.events.on("hashChangeStart", handleRouteChange);
        router.events.on("hashChangeComplete", handleRouteChange);
        router.events.on("routeChangeError", handleRouteChangeError);
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange);
            router.events.off("hashChangeStart", handleRouteChange);
            router.events.off("hashChangeComplete", handleRouteChange);
            router.events.off("routeChangeError", handleRouteChangeError);
        };
    }, [closeMobileSidebar, closeSearchDialog, navigateToPath, router.events]);

    useEffect(() => {
        router.beforePopState(({ as }) => {
            navigateToPath(as);
            startScrollTracking(as);
            closeMobileSidebar();
            closeSearchDialog();
            return true;
        });
    }, [router, navigateToPath, closeMobileSidebar, closeSearchDialog]);

    const frontmatter = getFrontmatter(resolvedPath);
    const activeTitle = convertToTitle(activeNavigatable, frontmatter);
    const activeDescription = convertDescriptionToString(activeNavigatable, frontmatter);

    return (
        <NavigationContext.Provider
            value={{
                domain,
                basePath: basePath != null && basePath.replace("/", "").trim().length > 0 ? basePath : undefined,
                activeNavigatable,
                onScrollToPath,
                registerScrolledToPathListener: scrollToPathListeners.registerListener,
                resolvedPath,
                activeVersion: versions[currentVersionIndex ?? 0],
                selectedSlug,
            }}
        >
            <Head>
                {activeTitle != null && <title>{title != null ? `${activeTitle} – ${title}` : activeTitle}</title>}
                {activeDescription != null && <meta name="description" content={activeDescription} />}
                {frontmatter?.image != null && <meta property="og:image" content={frontmatter.image} />}
            </Head>
            {children}
        </NavigationContext.Provider>
    );
};

function getFrontmatter(resolvedPath: ResolvedPath): FernDocsFrontmatter | undefined {
    if (resolvedPath.type === "custom-markdown-page" && typeof resolvedPath.serializedMdxContent !== "string") {
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

function convertDescriptionToString(
    page: SidebarNode.Page | undefined,
    frontmatter: FernDocsFrontmatter | undefined,
): string | undefined {
    const description = frontmatter?.description ?? page?.description ?? frontmatter?.excerpt ?? undefined;

    if (description == null) {
        return;
    }

    if (typeof description === "string") {
        return description;
    }

    const mdxContent = <MdxContent mdx={description} />;

    try {
        return renderToString(mdxContent);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error rendering MDX to string", e);

        emitDatadogError(e, {
            context: "NavigationContext",
            errorSource: "convertDescriptionToString",
            errorDescription:
                "An error occurred while rendering the description (which is a serialized MDX content) to string for the meta description tag. This impacts SEO",
        });

        return undefined;
    }
}

const resolveActiveSidebarNode = memoize(
    (sidebarNodes: SidebarNode[], fullSlug: string[]): SidebarNode.Page | undefined => {
        return traverseSidebarNodes(sidebarNodes, fullSlug).curr;
    },
    (_sidebarNodes, fullSlug) => fullSlug.join("/"),
);
