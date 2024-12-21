import type { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { SidebarTab, VersionSwitcherInfo } from "@fern-platform/fdr-utils";
import { isEqual } from "es-toolkit/predicate";
import { atom, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { DocsContent } from "../resolver/DocsContent";
import { DOCS_ATOM } from "./docs";
import { SLUG_ATOM } from "./location";
import { NavbarLink } from "./types";

export const DOMAIN_ATOM = atom<string>((get) => get(DOCS_ATOM).baseUrl.domain);
DOMAIN_ATOM.debugLabel = "DOMAIN_ATOM";

export const BASEPATH_ATOM = atom<string | undefined>(
  (get) => get(DOCS_ATOM).baseUrl.basePath
);
BASEPATH_ATOM.debugLabel = "BASEPATH_ATOM";

export const TABS_ATOM = selectAtom(
  DOCS_ATOM,
  (docs): readonly SidebarTab[] => docs.navigation.tabs,
  isEqual
);
TABS_ATOM.debugLabel = "TABS_ATOM";

export const VERSIONS_ATOM = selectAtom(
  DOCS_ATOM,
  (docs): readonly VersionSwitcherInfo[] => docs.navigation.versions,
  isEqual
);
VERSIONS_ATOM.debugLabel = "VERSIONS_ATOM";

export const CURRENT_TAB_INDEX_ATOM = atom<number | undefined>(
  (get) => get(DOCS_ATOM).navigation.currentTabIndex
);
CURRENT_TAB_INDEX_ATOM.debugLabel = "CURRENT_TAB_INDEX_ATOM";

export const CURRENT_VERSION_ID_ATOM = atom<
  FernNavigation.VersionId | undefined
>((get) => get(DOCS_ATOM).navigation.currentVersionId);
CURRENT_VERSION_ID_ATOM.debugLabel = "CURRENT_VERSION_ID_ATOM";

export const TRAILING_SLASH_ATOM = atom<boolean>(
  (get) => get(DOCS_ATOM).navigation.trailingSlash
);
TRAILING_SLASH_ATOM.debugLabel = "TRAILING_SLASH_ATOM";

export const NAVBAR_LINKS_ATOM = selectAtom(
  DOCS_ATOM,
  (docs): readonly NavbarLink[] => docs.navbarLinks,
  isEqual
);
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
  isEqual
);
SIDEBAR_ROOT_NODE_ATOM.debugLabel = "SIDEBAR_ROOT_NODE_ATOM";

// the initial path that was hard-navigated to
export const RESOLVED_PATH_ATOM = atom<DocsContent>(
  (get) => get(DOCS_ATOM).content
);
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

export const RESOLVED_API_DEFINITION_ATOM = atom<ApiDefinition | undefined>(
  (get) => {
    const content = get(RESOLVED_PATH_ATOM);
    return content.type === "api-endpoint-page" ||
      content.type === "api-reference-page"
      ? content.apiDefinition
      : undefined;
  }
);

export const NAVIGATION_NODES_ATOM = atom<FernNavigation.NodeCollector>(
  (get) => {
    const sidebar = get(SIDEBAR_ROOT_NODE_ATOM);
    return FernNavigation.NodeCollector.collect(sidebar);
  }
);
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
