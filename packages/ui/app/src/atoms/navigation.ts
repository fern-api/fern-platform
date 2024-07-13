import { DocsV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { SidebarTab, SidebarVersionInfo } from "@fern-ui/fdr-utils";
import { atom, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { isEqual } from "lodash-es";
import { ResolvedPath } from "../resolver/ResolvedPath";
import { DOCS_ATOM } from "./docs";
import { SLUG_ATOM } from "./location";

export const DOMAIN_ATOM = atom<string>((get) => get(DOCS_ATOM).baseUrl.domain);
export const BASEPATH_ATOM = atom<string | undefined>((get) => get(DOCS_ATOM).baseUrl.basePath);
export const TABS_ATOM = selectAtom(DOCS_ATOM, (docs): ReadonlyArray<SidebarTab> => docs.navigation.tabs, isEqual);
export const VERSIONS_ATOM = selectAtom(
    DOCS_ATOM,
    (docs): ReadonlyArray<SidebarVersionInfo> => docs.navigation.versions,
    isEqual,
);
export const CURRENT_TAB_INDEX_ATOM = atom<number | undefined>((get) => get(DOCS_ATOM).navigation.currentTabIndex);
export const CURRENT_VERSION_ID_ATOM = atom<FernNavigation.VersionId | undefined>(
    (get) => get(DOCS_ATOM).navigation.currentVersionId,
);
export const NAVBAR_LINKS_ATOM = selectAtom(
    DOCS_ATOM,
    (docs): ReadonlyArray<DocsV1Read.NavbarLink> => docs.navbarLinks,
    isEqual,
);

export const CURRENT_VERSION_ATOM = atom((get) => {
    const versionId = get(CURRENT_VERSION_ID_ATOM);
    const versions = get(VERSIONS_ATOM);
    return versions.find((v) => v.id === versionId);
});

export const UNVERSIONED_SLUG_ATOM = atom<string>((get) => {
    const slug = get(SLUG_ATOM);
    const currentVersion = get(CURRENT_VERSION_ATOM);
    const basePath = get(BASEPATH_ATOM);
    return FernNavigation.utils.getUnversionedSlug(slug, currentVersion?.slug, basePath);
});

export const CURRENT_TAB_ATOM = atom((get) => {
    const tabIndex = get(CURRENT_TAB_INDEX_ATOM);
    if (tabIndex == null) {
        return undefined;
    }
    const tabs = get(TABS_ATOM);
    return tabs[tabIndex];
});

export const SIDEBAR_ROOT_NODE_ATOM = selectAtom(
    DOCS_ATOM,
    (docs): FernNavigation.SidebarRootNode | undefined => docs.navigation.sidebar,
    isEqual,
);

// the initial path that was hard-navigated to
export const RESOLVED_PATH_ATOM = atom<ResolvedPath>((get) => get(DOCS_ATOM).resolvedPath);

export const NAVIGATION_NODES_ATOM = atom<FernNavigation.NodeCollector>((get) => {
    const sidebar = get(SIDEBAR_ROOT_NODE_ATOM);
    return FernNavigation.NodeCollector.collect(sidebar);
});

export function useSidebarNodes(): FernNavigation.SidebarRootNode | undefined {
    return useAtomValue(SIDEBAR_ROOT_NODE_ATOM);
}

export function useNavigationNodes(): FernNavigation.NodeCollector {
    return useAtomValue(NAVIGATION_NODES_ATOM);
}

export const CURRENT_NODE_ATOM = atom((get) => {
    const slug = get(SLUG_ATOM);
    const nodeCollector = get(NAVIGATION_NODES_ATOM);
    return nodeCollector.slugMap.get(slug);
});

export const CURRENT_NODE_ID_ATOM = atom((get) => {
    const node = get(CURRENT_NODE_ATOM);
    return node?.id;
});

export function useCurrentNodeId(): FernNavigation.NodeId | undefined {
    return useAtomValue(CURRENT_NODE_ID_ATOM);
}

export function useResolvedPath(): ResolvedPath {
    return useAtomValue(RESOLVED_PATH_ATOM);
}

export function useDomain(): string {
    return useAtomValue(DOMAIN_ATOM);
}

export function useBasePath(): string | undefined {
    return useAtomValue(BASEPATH_ATOM);
}
