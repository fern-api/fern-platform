import type { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion, withDefaultProtocol } from "@fern-api/ui-core-utils";
import type { SidebarTab, VersionSwitcherInfo } from "@fern-ui/fdr-utils";
import { useEventCallback } from "@fern-ui/react-commons";
import { isEqual } from "es-toolkit/predicate";
import { atom, useAtomValue, type Atom, type Getter } from "jotai";
import { atomWithLocation } from "jotai-location";
import { selectAtom, useAtomCallback } from "jotai/utils";
import { Router } from "next/router";
import { useCallback } from "react";
import useSWR, { preload, type Fetcher, type SWRConfiguration, type SWRResponse } from "swr";
import useSWRImmutable from "swr/immutable";
import urlJoin from "url-join";
import { useCallbackOne } from "use-memo-one";
import { z } from "zod";
import type { DocsContent } from "../resolver/DocsContent";
import { withSkewProtection } from "../util/withSkewProtection";
import { WRITE_API_DEFINITION_ATOM } from "./apis";
import { DOCS_ATOM } from "./docs";
import { useAtomEffect } from "./hooks";
import type { NavbarLink } from "./types";

export const DOMAIN_ATOM = atom<string>((get) => get(DOCS_ATOM).baseUrl.domain);
DOMAIN_ATOM.debugLabel = "DOMAIN_ATOM";

export const BASEPATH_ATOM = atom<string | undefined>((get) => get(DOCS_ATOM).baseUrl.basePath);
BASEPATH_ATOM.debugLabel = "BASEPATH_ATOM";

export const TABS_ATOM = selectAtom(DOCS_ATOM, (docs): ReadonlyArray<SidebarTab> => docs.navigation.tabs, isEqual);
TABS_ATOM.debugLabel = "TABS_ATOM";

export const VERSIONS_ATOM = selectAtom(
    DOCS_ATOM,
    (docs): ReadonlyArray<VersionSwitcherInfo> => docs.navigation.versions,
    isEqual,
);
VERSIONS_ATOM.debugLabel = "VERSIONS_ATOM";

export const CURRENT_TAB_INDEX_ATOM = atom<number | undefined>((get) => get(DOCS_ATOM).navigation.currentTabIndex);
CURRENT_TAB_INDEX_ATOM.debugLabel = "CURRENT_TAB_INDEX_ATOM";

export const CURRENT_VERSION_ID_ATOM = atom<FernNavigation.VersionId | undefined>(
    (get) => get(DOCS_ATOM).navigation.currentVersionId,
);
CURRENT_VERSION_ID_ATOM.debugLabel = "CURRENT_VERSION_ID_ATOM";

export const TRAILING_SLASH_ATOM = atom<boolean>((get) => get(DOCS_ATOM).navigation.trailingSlash);
TRAILING_SLASH_ATOM.debugLabel = "TRAILING_SLASH_ATOM";

export const NAVBAR_LINKS_ATOM = selectAtom(DOCS_ATOM, (docs): ReadonlyArray<NavbarLink> => docs.navbarLinks, isEqual);
NAVBAR_LINKS_ATOM.debugLabel = "NAVBAR_LINKS_ATOM";

export const CURRENT_VERSION_ATOM = atom((get) => {
    const versionId = get(CURRENT_VERSION_ID_ATOM);
    const versions = get(VERSIONS_ATOM);
    return versions.find((v) => v.id === versionId);
});
CURRENT_VERSION_ATOM.debugLabel = "CURRENT_VERSION_ATOM";

export const CURRENT_TAB_ATOM = atom((get) => {
    const tabIndex = get(CURRENT_TAB_INDEX_ATOM);
    if (tabIndex == null) {
        return undefined;
    }
    const tabs = get(TABS_ATOM);
    return tabs[tabIndex];
});
CURRENT_TAB_ATOM.debugLabel = "CURRENT_TAB_ATOM";

export const SIDEBAR_ROOT_NODE_ATOM = selectAtom(
    DOCS_ATOM,
    (docs): FernNavigation.SidebarRootNode | undefined => docs.navigation.sidebar,
    isEqual,
);
SIDEBAR_ROOT_NODE_ATOM.debugLabel = "SIDEBAR_ROOT_NODE_ATOM";

// the initial path that was hard-navigated to
export const RESOLVED_PATH_ATOM = atom<DocsContent>((get) => get(DOCS_ATOM).content);
RESOLVED_PATH_ATOM.debugLabel = "RESOLVED_PATH_ATOM";

export const NEIGHBORS_ATOM = atom((get) => {
    const content = get(RESOLVED_PATH_ATOM);
    if (content.type === "api-reference-page" || content.type === "changelog") {
        return {
            prev: null,
            next: null,
        };
    }
    return content.neighbors;
});

export const RESOLVED_API_DEFINITION_ATOM = atom<ApiDefinition | undefined>((get) => {
    const content = get(RESOLVED_PATH_ATOM);
    return content.type === "api-endpoint-page" || content.type === "api-reference-page"
        ? content.apiDefinition
        : undefined;
});

export const NAVIGATION_NODES_ATOM = atom<FernNavigation.NodeCollector>((get) => {
    const sidebar = get(SIDEBAR_ROOT_NODE_ATOM);
    return FernNavigation.NodeCollector.collect(sidebar);
});
NAVIGATION_NODES_ATOM.debugLabel = "NAVIGATION_NODES_ATOM";

export function useSidebarNodes(): FernNavigation.SidebarRootNode | undefined {
    return useAtomValue(SIDEBAR_ROOT_NODE_ATOM);
}

export function useNavigationNodes(): FernNavigation.NodeCollector {
    return useAtomValue(NAVIGATION_NODES_ATOM);
}

export const CURRENT_NODE_ATOM = atom((get) => {
    const slug = get(SLUG_ATOM);
    const nodeCollector = get(NAVIGATION_NODES_ATOM);
    const node = nodeCollector.slugMap.get(slug);

    // TODO: move this into a better place
    // this sets the document title to the current node's title when shallow routing
    // (this will use the navigation node title rather than the page's actual title)
    if (node && typeof window !== "undefined") {
        window.document.title = node.title;
    }
    return node;
});
CURRENT_NODE_ATOM.debugLabel = "CURRENT_NODE_ATOM";

export const CURRENT_NODE_ID_ATOM = atom((get) => {
    const node = get(CURRENT_NODE_ATOM);
    return node?.id;
});
CURRENT_NODE_ID_ATOM.debugLabel = "CURRENT_NODE_ID_ATOM";

export function useCurrentNodeId(): FernNavigation.NodeId | undefined {
    return useAtomValue(CURRENT_NODE_ID_ATOM);
}

export function useDocsContent(): DocsContent {
    return useAtomValue(RESOLVED_PATH_ATOM);
}

export function useDomain(): string {
    return useAtomValue(DOMAIN_ATOM);
}

export function useBasePath(): string | undefined {
    return useAtomValue(BASEPATH_ATOM);
}

export const LOCATION_ATOM = atomWithLocation({
    subscribe: (callback) => {
        Router.events.on("routeChangeComplete", callback);
        Router.events.on("routeChangeError", callback);
        Router.events.on("hashChangeComplete", callback);
        return () => {
            Router.events.off("routeChangeComplete", callback);
            Router.events.off("routeChangeError", callback);
            Router.events.off("hashChangeComplete", callback);
        };
    },
});
LOCATION_ATOM.debugLabel = "LOCATION_ATOM";

export const ANCHOR_ATOM = atom(
    (get) => get(LOCATION_ATOM).hash?.slice(1),
    (get, set, anchor: string | undefined) => {
        const location = get(LOCATION_ATOM);
        const hash = anchor != null ? `#${anchor}` : undefined;
        if (location.hash === hash) {
            return;
        }
        set(LOCATION_ATOM, { ...get(LOCATION_ATOM), hash }, { replace: true });
    },
);
ANCHOR_ATOM.debugLabel = "ANCHOR_ATOM";

export const SLUG_ATOM = atom(
    (get) => {
        const location = get(LOCATION_ATOM);
        if (location.pathname == null) {
            return get(RESOLVED_PATH_ATOM).slug;
        }
        return FernNavigation.Slug(location.pathname?.replace(/^\/|\/$/g, "") ?? "");
    },
    (get, set, slug: FernNavigation.Slug) => {
        const location = get(LOCATION_ATOM);
        const pathname = selectHref(get, slug);
        if (location.pathname === pathname) {
            return;
        }

        // eslint-disable-next-line no-console
        console.debug("setting location to in slug atom", pathname);

        // replaces the current location with the new slug, and removes any hash (from an anchor) that may be present
        set(LOCATION_ATOM, { pathname, searchParams: location.searchParams, hash: "" }, { replace: true });
    },
);
SLUG_ATOM.debugLabel = "SLUG_ATOM";

export function useRouteListener(slug: FernNavigation.Slug, callback: (hash: string | undefined) => void): void {
    const callbackRef = useEventCallback(callback);
    const route = useHref(slug);
    return useAtomEffect(
        useCallbackOne(
            (get) => {
                const location = get(LOCATION_ATOM);
                if (location.pathname?.toLowerCase() === route.toLowerCase()) {
                    setTimeout(() => callbackRef(get(ANCHOR_ATOM)), 0);
                }
            },
            [route, callbackRef],
        ),
    );
}

let justNavigatedTimeout: number;

/**
 * This atom is used to prevent the slug from being updated when the user navigates to a new page,
 * which sometimes happens when the on-scroll useApiPageCenterElement is overly sensitive.
 */
export const JUST_NAVIGATED_ATOM = atom(true);
JUST_NAVIGATED_ATOM.debugLabel = "JUST_NAVIGATED_ATOM";

export function useSetJustNavigated(): [set: () => void, destroy: () => void] {
    // note: JUST_NAVIGATED_ATOM is never "mounted" so we need to implement mount/unmount as an effect
    useAtomEffect(
        useCallbackOne((_get, set) => {
            window.clearTimeout(justNavigatedTimeout);
            justNavigatedTimeout = window.setTimeout(() => {
                set(JUST_NAVIGATED_ATOM, false);
            }, 1000);
            return () => {
                window.clearTimeout(justNavigatedTimeout);
            };
        }, []),
    );
    return [
        useAtomCallback(
            useCallbackOne((_get, set) => {
                window.clearTimeout(justNavigatedTimeout);
                set(JUST_NAVIGATED_ATOM, true);
                justNavigatedTimeout = window.setTimeout(() => {
                    set(JUST_NAVIGATED_ATOM, false);
                }, 1000);
            }, []),
        ),
        useCallback(() => {
            window.clearTimeout(justNavigatedTimeout);
        }, []),
    ];
}

export function getToHref(includeTrailingSlash: boolean = false): (slug: FernNavigation.Slug, host?: string) => string {
    return (slug, host) => {
        const path = slug === "" ? "/" : includeTrailingSlash ? `/${slug}/` : `/${slug}`;
        if (host == null) {
            return path;
        }
        return urlJoin(withDefaultProtocol(host), path);
    };
}

export function useToHref(): (slug: FernNavigation.Slug) => string {
    return getToHref(useAtomValue(TRAILING_SLASH_ATOM));
}

export function useHref(slug: FernNavigation.Slug, anchor?: string): string;
export function useHref(slug: FernNavigation.Slug | undefined, anchor?: string): string | undefined;
export function useHref(slug: FernNavigation.Slug | undefined, anchor?: string): string | undefined {
    const toHref = useToHref();
    if (slug == null) {
        return anchor;
    }
    const pathName = toHref(slug);
    return anchor != null ? `${pathName}#${anchor}` : pathName;
}

export function selectHref(get: <T>(atom: Atom<T>) => T, slug: FernNavigation.Slug): string {
    return getToHref(get(TRAILING_SLASH_ATOM))(slug);
}

export type FernDocsApiRoute = `/api/fern-docs/${string}`;

// see useHref.ts for a similar pattern
export function getApiRouteSupplier({
    includeTrailingSlash,
    basepath,
}: {
    includeTrailingSlash?: boolean;
    basepath?: string;
}): (route: FernDocsApiRoute) => string {
    return (route) => {
        // note: if the first argument of urjoin is "", it will strip the leading slash. `|| "/"` ensures "" -> "/"
        if (includeTrailingSlash) {
            return urlJoin(basepath || "/", route, "/");
        } else {
            return urlJoin(basepath || "/", route);
        }
    };
}

export function useApiRoute(
    route: FernDocsApiRoute,
    options?: {
        includeTrailingSlash?: boolean;
        basepath?: string;
    },
): string {
    const basepath = useAtomValue(BASEPATH_ATOM);
    const includeTrailingSlash = useAtomValue(TRAILING_SLASH_ATOM);
    return getApiRouteSupplier({ includeTrailingSlash, basepath, ...options })(route);
}

export function selectApiRoute(
    get: Getter,
    route: FernDocsApiRoute,
    options?: {
        includeTrailingSlash?: boolean;
        basepath?: string;
    },
): string {
    const basepath = get(BASEPATH_ATOM);
    const includeTrailingSlash = get(TRAILING_SLASH_ATOM);
    return getApiRouteSupplier({ includeTrailingSlash, basepath, ...options })(route);
}

interface Options<T> extends SWRConfiguration<T, Error, Fetcher<T>> {
    disabled?: boolean;
    request?: RequestInit & { headers?: Record<string, string> };
    validate?: z.ZodType<T>;
}

function createFetcher<T>(
    init?: RequestInit & { headers?: Record<string, string> },
    validate?: z.ZodType<T>,
): (url: string) => Promise<T> {
    return async (url: string): Promise<T> => {
        const request = { ...init, headers: withSkewProtection(init?.headers) };
        const r = await fetch(url, request);
        const data = await r.json();
        if (validate) {
            return validate.parse(data);
        }
        return data;
    };
}

export function useApiRouteSWR<T>(
    route: FernDocsApiRoute,
    { disabled, request, validate, ...options }: Options<T> = {},
): SWRResponse<T> {
    const key = useApiRoute(route);
    return useSWR(disabled ? null : key, createFetcher(request, validate), options);
}

export function useApiRouteSWRImmutable<T>(
    route: FernDocsApiRoute,
    { disabled, request, validate, ...options }: Options<T> = {},
): SWRResponse<T> {
    const key = useApiRoute(route);
    return useSWRImmutable(disabled ? null : key, createFetcher(request, validate), options);
}

const fetcher = (url: string): Promise<ApiDefinition> => fetch(url).then((res) => res.json());

export function usePreloadApiLeaf(): (node: FernNavigation.NavigationNodeApiLeaf) => Promise<ApiDefinition> {
    return useAtomCallback(
        useCallbackOne(async (get, set, node: FernNavigation.NavigationNodeApiLeaf) => {
            const route = selectApiRoute(
                get,
                `/api/fern-docs/api-definition/${encodeURIComponent(node.apiDefinitionId)}/${visitDiscriminatedUnion(
                    node,
                )._visit({
                    endpoint: (node) => `endpoint/${encodeURIComponent(node.endpointId)}`,
                    webSocket: (node) => `websocket/${encodeURIComponent(node.webSocketId)}`,
                    webhook: (node) => `webhook/${encodeURIComponent(node.webhookId)}`,
                })}`,
            );
            const apiDefinition = await preload(route, fetcher);
            set(WRITE_API_DEFINITION_ATOM, apiDefinition);
            return apiDefinition;
        }, []),
    );
}
