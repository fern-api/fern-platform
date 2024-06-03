import { FernNavigation } from "@fern-api/fdr-sdk";
import { useEventCallback } from "@fern-ui/react-commons";
import { debounce } from "lodash-es";
import Head from "next/head";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { renderToString } from "react-dom/server";
import { captureSentryError } from "../../analytics/sentry";
import { MdxContent } from "../../mdx/MdxContent";
import { FernDocsFrontmatter } from "../../mdx/mdx";
import { ResolvedPath } from "../../resolver/ResolvedPath";
import { useCloseMobileSidebar, useCloseSearchDialog } from "../../sidebar/atom";
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
    let lastNode: HTMLElement | undefined;
    function handleObservation() {
        const { node } = getRouteNodeWithAnchor(route);
        if (node != null) {
            if (lastNode !== node) {
                lastActiveNavigatableOffsetTop = undefined;
            }
            lastNode = node;
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
    const { nodes, versions, currentVersionId } = useDocsContext();
    const { isApiScrollingDisabled } = useFeatureFlags();
    const router = useRouter();

    const [activeNavigatable, setActiveNavigatable] = useState(() => nodes.slugMap.get(resolvedPath.fullSlug));

    const [, anchor] = router.asPath.split("#");
    const selectedSlug = activeNavigatable?.slug ?? "";
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
                setActiveNavigatable(nodes.slugMap.get(fullSlug));
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
        setActiveNavigatable(nodes.slugMap.get(fullSlug));
        startScrollTracking(route);
    });

    const closeMobileSidebar = useCloseMobileSidebar();
    const closeSearchDialog = useCloseSearchDialog();

    useEffect(() => {
        const handleRouteChange = (route: string, options: { shallow: boolean }) => {
            if (!options.shallow) {
                userIsScrolling = false;
                userHasScrolled = false;
                try {
                    if (window.analytics) {
                        window.analytics.page({ url: window.location.href, path: route });
                    }
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error("Failed to send page view to Segment:", error);
                }
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
    const activeDescription = convertDescriptionToString(frontmatter);

    return (
        <NavigationContext.Provider
            value={useMemo(
                () => ({
                    domain,
                    basePath: basePath != null && basePath.replace("/", "").trim().length > 0 ? basePath : undefined,
                    activeNavigatable,
                    onScrollToPath,
                    registerScrolledToPathListener: scrollToPathListeners.registerListener,
                    resolvedPath,
                    activeVersion: versions.find((version) => version.id === currentVersionId),
                    selectedSlug,
                    unversionedSlug: FernNavigation.utils.getUnversionedSlug(
                        selectedSlug,
                        versions.find((version) => version.id === currentVersionId)?.slug,
                        basePath,
                    ),
                }),
                [
                    activeNavigatable,
                    basePath,
                    currentVersionId,
                    domain,
                    onScrollToPath,
                    resolvedPath,
                    scrollToPathListeners.registerListener,
                    selectedSlug,
                    versions,
                ],
            )}
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
    page: FernNavigation.NavigationNodeWithMetadata | undefined,
    frontmatter: FernDocsFrontmatter | undefined,
): string | undefined {
    return frontmatter?.title ?? page?.title;
}

function convertDescriptionToString(frontmatter: FernDocsFrontmatter | undefined): string | undefined {
    // const description = frontmatter?.description ?? page?.description ?? frontmatter?.excerpt ?? undefined;
    const description = frontmatter?.description ?? frontmatter?.excerpt ?? undefined;

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

        captureSentryError(e, {
            context: "NavigationContext",
            errorSource: "convertDescriptionToString",
            errorDescription:
                "An error occurred while rendering the description (which is a serialized MDX content) to string for the meta description tag. This impacts SEO",
        });

        return undefined;
    }
}
