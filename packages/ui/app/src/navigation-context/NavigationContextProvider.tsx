import { NavigatableDocsNode } from "@fern-api/fdr-sdk";
import { FernDocsFrontmatter, getFullSlugForNavigatable, type ResolvedPath } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState, useEventCallback } from "@fern-ui/react-commons";
import { debounce } from "lodash-es";
import Head from "next/head";
import { useRouter } from "next/router";
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { getRouteNode } from "../util/anchor";
import { getRouteForResolvedPath } from "./getRouteForResolvedPath";
import { NavigationContext } from "./NavigationContext";
import { useSlugListeners } from "./useSlugListeners";

export declare namespace NavigationContextProvider {
    export type Props = PropsWithChildren<{
        resolvedPath: ResolvedPath;
        basePath: string | undefined;
    }>;
}

export const NavigationContextProvider: React.FC<NavigationContextProvider.Props> = ({
    resolvedPath,
    children,
    basePath,
}) => {
    const { pathResolver } = useDocsContext();
    const router = useRouter();
    const userIsScrolling = useRef(false);
    const resolvedRoute = getRouteForResolvedPath({
        resolvedSlug: resolvedPath.fullSlug,
        asPath: router.asPath, // do not include basepath because it is already included
    });
    const justNavigatedTo = useRef<string | undefined>(resolvedRoute);

    const [activeNavigatable, setActiveNavigatable] = useState(() => {
        return pathResolver.resolveNavigatable(resolvedPath.fullSlug);
    });

    const selectedSlug = getFullSlugForNavigatable(activeNavigatable, { omitDefault: true, basePath });

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

    const observeDocContent = useCallback((element: HTMLDivElement) => {
        const handleNavigate = () => {
            if (justNavigatedTo.current != null) {
                navigateToRoute.current(justNavigatedTo.current, true);
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
        const navigatable = pathResolver.resolveNavigatable(fullSlug);
        if (navigatable != null) {
            setActiveNavigatable(navigatable);
        }
        void router.replace(`/${fullSlug}`, undefined, { shallow: true, scroll: false });
        scrollToPathListeners.invokeListeners(fullSlug);
    });

    const timeout = useRef<NodeJS.Timeout>();

    const navigateToPath = useEventCallback((route: string, shallow = false) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const fullSlug = route.substring(1).split("#")[0]!;
        justNavigated.current = true;
        const navigatable = pathResolver.resolveNavigatable(fullSlug);
        navigateToRoute.current(route, !shallow);
        if (navigatable != null) {
            setActiveNavigatable(navigatable);
        }
        // navigateToPathListeners.invokeListeners(slug);
        timeout.current != null && clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            justNavigated.current = false;
        }, 500);
    });

    useEffect(() => {
        const handleRouteChangeStart = (route: string, { shallow }: { shallow: boolean }) => {
            navigateToPath(route, shallow);
        };
        router.events.on("routeChangeComplete", handleRouteChangeStart);
        router.events.on("hashChangeComplete", handleRouteChangeStart);
        return () => {
            router.events.off("routeChangeComplete", handleRouteChangeStart);
            router.events.off("hashChangeComplete", handleRouteChangeStart);
        };
    }, [navigateToPath, router.events]);

    useEffect(() => {
        router.beforePopState(({ as }) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const slugCandidate = as.substring(1).split("#")[0]!;
            const previousNavigatable = pathResolver.resolveNavigatable(slugCandidate);
            if (previousNavigatable != null) {
                const fullSlug = getFullSlugForNavigatable(previousNavigatable, { basePath });
                navigateToPath(fullSlug);
            }
            return true;
        });
    }, [router, navigateToPath, pathResolver, basePath]);

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
                justNavigated: justNavigatedTo.current != null,
                activeNavigatable,
                navigateToPath,
                userIsScrolling: () => userIsScrolling.current,
                onScrollToPath,
                observeDocContent,
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
    navigatable: NavigatableDocsNode | undefined,
    frontmatter: FernDocsFrontmatter | undefined,
): string | undefined {
    if (navigatable == null) {
        return undefined;
    }
    return visitDiscriminatedUnion(navigatable, "type")._visit({
        page: (page) => frontmatter?.title ?? page.page.title,
        "top-level-endpoint": (endpoint) => endpoint.endpoint.name,
        "top-level-webhook": (webhook) => webhook.webhook.name,
        webhook: (webhook) => webhook.webhook.name,
        endpoint: (endpoint) => endpoint.endpoint.name,
        _other: () => undefined,
    });
}

function convertToDescription(
    navigatable: NavigatableDocsNode | undefined,
    frontmatter: FernDocsFrontmatter | undefined,
): string | undefined {
    if (navigatable == null) {
        return undefined;
    }
    return visitDiscriminatedUnion(navigatable, "type")._visit({
        page: () => frontmatter?.description,
        "top-level-endpoint": (endpoint) => endpoint.endpoint.description,
        "top-level-webhook": (webhook) => webhook.webhook.description,
        webhook: (webhook) => webhook.webhook.description,
        endpoint: (endpoint) => endpoint.endpoint.description,
        _other: () => undefined,
    });
}
