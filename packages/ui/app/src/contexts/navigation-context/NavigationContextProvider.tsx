import { CURRENT_NODE_ATOM, useFeatureFlags } from "@/atoms";
import { useEventCallback } from "@fern-ui/react-commons";
import fastdom from "fastdom";
import { useAtomValue } from "jotai";
import { debounce } from "lodash-es";
import { Router, useRouter } from "next/router";
import { PropsWithChildren, useEffect, useMemo } from "react";
import { noop } from "ts-essentials";
import { getRouteNodeWithAnchor } from "../../util/anchor";
import { NavigationContext } from "./NavigationContext";

export declare namespace NavigationContextProvider {
    export type Props = PropsWithChildren<{
        basePath: string | undefined;
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

let cancelMeasure = noop;
function startScrollTracking(route: string, scrolledHere: boolean = false) {
    if (!userIsScrolling && !scrolledHere) {
        getRouteNodeWithAnchor(route)?.node?.scrollIntoView({ behavior: "auto" });
    }
    userHasScrolled = scrolledHere;
    let lastActiveNavigatableOffsetTop: number | undefined;
    lastScrollY = window.scrollTop;
    let lastNode: HTMLElement | undefined;
    function handleObservation() {
        fastdom.clear(cancelMeasure);
        cancelMeasure = fastdom.measure(() => {
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
        });
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

export const NavigationContextProvider: React.FC<NavigationContextProvider.Props> = ({ children }) => {
    const { isApiScrollingDisabled } = useFeatureFlags();
    const router = useRouter();
    const activeNavigatable = useAtomValue(CURRENT_NODE_ATOM);

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

    const onScrollToPath = useEventCallback(
        debounce(
            (slug: string) => {
                if (slug === selectedSlug || justNavigatedTo != null || isApiScrollingDisabled) {
                    return;
                }
                justScrolledTo = `/${slug}`;
                void router.replace(`/${slug}`, undefined, { shallow: true, scroll: false });
                startScrollTracking(`/${slug}`, true);
            },
            100,
            { trailing: true },
        ),
    );

    const navigateToPath = useEventCallback((route: string) => {
        if (route === resolvedRoute || justNavigatedTo === route || justScrolledTo === route) {
            return;
        }
        justScrolledTo = undefined;
        startScrollTracking(route);
    });

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
        Router.events.on("routeChangeComplete", handleRouteChange);
        Router.events.on("hashChangeStart", handleRouteChange);
        Router.events.on("hashChangeComplete", handleRouteChange);
        Router.events.on("routeChangeError", handleRouteChangeError);
        return () => {
            Router.events.off("routeChangeComplete", handleRouteChange);
            Router.events.off("hashChangeStart", handleRouteChange);
            Router.events.off("hashChangeComplete", handleRouteChange);
            Router.events.off("routeChangeError", handleRouteChangeError);
        };
    }, [navigateToPath]);

    useEffect(() => {
        router.beforePopState(({ as }) => {
            navigateToPath(as);
            startScrollTracking(as);
            return true;
        });
    }, [router, navigateToPath]);

    return (
        <NavigationContext.Provider value={useMemo(() => ({ onScrollToPath }), [onScrollToPath])}>
            {children}
        </NavigationContext.Provider>
    );
};

// function convertToTitle(
//     page: FernNavigation.NavigationNodeWithMetadata | undefined,
//     frontmatter: FernDocsFrontmatter | undefined,
// ): string | undefined {
//     return frontmatter?.title ?? page?.title;
// }

// function convertDescriptionToString(frontmatter: FernDocsFrontmatter | undefined): string | undefined {
//     // const description = frontmatter?.description ?? page?.description ?? frontmatter?.excerpt ?? undefined;
//     const description = frontmatter?.description ?? frontmatter?.excerpt ?? undefined;

//     if (description == null) {
//         return;
//     }

//     if (typeof description === "string") {
//         return description;
//     }

//     const mdxContent = <MdxContent mdx={description} />;

//     try {
//         return renderToString(mdxContent);
//     } catch (e) {
//         // eslint-disable-next-line no-console
//         console.error("Error rendering MDX to string", e);

//         captureSentryError(e, {
//             context: "NavigationContext",
//             errorSource: "convertDescriptionToString",
//             errorDescription:
//                 "An error occurred while rendering the description (which is a serialized MDX content) to string for the meta description tag. This impacts SEO",
//         });

//         return undefined;
//     }
// }
