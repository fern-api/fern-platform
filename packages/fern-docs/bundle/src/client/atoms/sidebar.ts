import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { RESET, atomWithDefault, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { useCallbackOne, useMemoOne } from "use-memo-one";
import { EDGE_FLAGS_ATOM } from "./flags";
import { useAtomEffect } from "./hooks";
import { DOCS_LAYOUT_ATOM } from "./layout";
import {
  CURRENT_NODE_ID_ATOM,
  NAVIGATION_NODES_ATOM,
  RESOLVED_PATH_ATOM,
  SIDEBAR_ROOT_NODE_ATOM,
  TABS_ATOM,
} from "./navigation";
import { THEME_ATOM } from "./theme";
import { IS_MOBILE_SCREEN_ATOM, MOBILE_SIDEBAR_ENABLED_ATOM } from "./viewport";

function getNavigationChildToParentsMap(
  sidebar: FernNavigation.SidebarRootNode | undefined
): ReadonlyMap<FernNavigation.NodeId, FernNavigation.NodeId[]> {
  const childToParentsMap = new Map<
    FernNavigation.NodeId,
    FernNavigation.NodeId[]
  >();
  if (sidebar == null) {
    return childToParentsMap;
  }

  FernNavigation.traverseDF(sidebar, (node, parents) => {
    childToParentsMap.set(
      node.id,
      parents.map((p) => p.id)
    );
  });

  return childToParentsMap;
}

function invertParentChildMap(
  parentChildMap: ReadonlyMap<FernNavigation.NodeId, FernNavigation.NodeId[]>
): ReadonlyMap<FernNavigation.NodeId, FernNavigation.NodeId[]> {
  const invertedParentChildMap = new Map<
    FernNavigation.NodeId,
    FernNavigation.NodeId[]
  >();
  parentChildMap.forEach((children, parent) => {
    children.forEach((child) => {
      const parents = invertedParentChildMap.get(child) ?? [];
      parents.push(parent);
      invertedParentChildMap.set(child, parents);
    });
  });
  return invertedParentChildMap;
}

export const SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM = atom((get) => {
  return getNavigationChildToParentsMap(get(SIDEBAR_ROOT_NODE_ATOM));
});

export const SIDEBAR_PARENT_TO_CHILDREN_MAP_ATOM = atom((get) => {
  return invertParentChildMap(get(SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM));
});

const INTERNAL_EXPANDED_SIDEBAR_NODES_ATOM = atomWithDefault<{
  sidebarRootId: FernNavigation.NodeId;
  expandedNodes: Set<FernNavigation.NodeId>;
  implicitExpandedNodes: Set<FernNavigation.NodeId>;
}>((get) => {
  const sidebar = get(SIDEBAR_ROOT_NODE_ATOM);
  const expandedNodes = new Set<FernNavigation.NodeId>();
  const childToParentsMap = get(SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM);
  const currentNode = get(CURRENT_NODE_ID_ATOM);
  if (currentNode != null) {
    expandedNodes.add(currentNode);
    childToParentsMap.get(currentNode)?.forEach((parent) => {
      expandedNodes.add(parent);
    });
  }

  return {
    sidebarRootId: sidebar?.id ?? FernNavigation.NodeId(""),
    expandedNodes: new Set(),
    implicitExpandedNodes: expandedNodes,
  };
});

export function useInitSidebarExpandedNodes(): void {
  useAtomEffect(
    useCallbackOne((get, set) => {
      const currentNodeId = get(CURRENT_NODE_ID_ATOM);

      if (currentNodeId == null) {
        return;
      }

      const sidebarNodeId = get.peek(SIDEBAR_ROOT_NODE_ATOM)?.id;

      // resets the sidebar expanded state when switching between tabs or versions
      if (
        sidebarNodeId !==
        get.peek(INTERNAL_EXPANDED_SIDEBAR_NODES_ATOM).sidebarRootId
      ) {
        set(INTERNAL_EXPANDED_SIDEBAR_NODES_ATOM, RESET);
        return;
      }

      set(INTERNAL_EXPANDED_SIDEBAR_NODES_ATOM, (prev) => {
        const childToParentsMap = get.peek(SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM);

        // always clear the implicitly expanded nodes as a side effect of changing the current node
        const implicitExpandedNodes = new Set<FernNavigation.NodeId>();
        implicitExpandedNodes.add(currentNodeId);
        childToParentsMap.get(currentNodeId)?.forEach((parent) => {
          implicitExpandedNodes.add(parent);
        });
        return {
          sidebarRootId: prev.sidebarRootId,
          expandedNodes: prev.expandedNodes,
          implicitExpandedNodes,
        };
      });
    }, [])
  );
}

export const useIsExpandedSidebarNode = (
  nodeId: FernNavigation.NodeId
): boolean => {
  return useAtomValue(
    useMemoOne(
      () =>
        atom((get) => {
          const { expandedNodes, implicitExpandedNodes } = get(
            INTERNAL_EXPANDED_SIDEBAR_NODES_ATOM
          );
          return expandedNodes.has(nodeId) || implicitExpandedNodes.has(nodeId);
        }),
      [nodeId]
    )
  );
};

export const useIsSelectedSidebarNode = (
  nodeId: FernNavigation.NodeId
): boolean => {
  return useAtomValue(
    useMemoOne(
      () => atom((get) => nodeId === get(CURRENT_NODE_ID_ATOM)),
      [nodeId]
    )
  );
};

export const useIsChildSelected = (
  parentId: FernNavigation.NodeId
): boolean => {
  return useAtomValue(
    useMemoOne(
      () =>
        atom((get) => {
          const selectedNodeId = get(CURRENT_NODE_ID_ATOM);
          if (selectedNodeId === parentId) {
            return true;
          } else if (selectedNodeId == null) {
            return false;
          }

          const parentToChildrenMap = get(SIDEBAR_PARENT_TO_CHILDREN_MAP_ATOM);
          return (
            parentToChildrenMap.get(parentId)?.includes(selectedNodeId) ?? false
          );
        }),
      [parentId]
    )
  );
};

export const useToggleExpandedSidebarNode = (
  nodeId: FernNavigation.NodeId
): (() => void) => {
  return useAtomCallback(
    useCallbackOne(
      (get, set) => {
        const parentToChildrenMap = get(SIDEBAR_PARENT_TO_CHILDREN_MAP_ATOM);
        const childToParentsMap = get(SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM);

        set(INTERNAL_EXPANDED_SIDEBAR_NODES_ATOM, (prev) => {
          const expandedNodes = new Set(prev.expandedNodes);
          const implicitExpandedNodes = new Set(prev.implicitExpandedNodes);
          const collector = get(NAVIGATION_NODES_ATOM);

          if (
            prev.expandedNodes.has(nodeId) ||
            prev.implicitExpandedNodes.has(nodeId)
          ) {
            const node = collector.get(nodeId);

            if (
              node != null &&
              node.id !== get(CURRENT_NODE_ID_ATOM) &&
              FernNavigation.hasMarkdown(node)
            ) {
              return prev;
            }

            // remove this node and all children from the expanded set
            // return prev.filter((id) => id !== nodeId && !parentToChildrenMap.get(nodeId)?.includes(id));
            expandedNodes.delete(nodeId);
            implicitExpandedNodes.delete(nodeId);
            parentToChildrenMap.get(nodeId)?.forEach((child) => {
              expandedNodes.delete(child);
              implicitExpandedNodes.delete(child);
            });
            return {
              sidebarRootId: prev.sidebarRootId,
              expandedNodes,
              implicitExpandedNodes,
            };
          } else {
            const parents = childToParentsMap.get(nodeId) ?? [];
            const { isApiScrollingDisabled } = get(EDGE_FLAGS_ATOM);

            // if long scrolling is enabled, implicitly "expand" its parent nodes
            if (!isApiScrollingDisabled) {
              const isLongScrollingApiReference = [...parents, nodeId]
                .map((id) => collector.get(id))
                .some(
                  (node) => node?.type === "apiReference" && !node.paginated
                );
              if (isLongScrollingApiReference) {
                implicitExpandedNodes.add(nodeId);
                parents.forEach((parent) => {
                  implicitExpandedNodes.add(parent);
                });
                return {
                  sidebarRootId: prev.sidebarRootId,
                  expandedNodes,
                  implicitExpandedNodes,
                };
              }
            }

            expandedNodes.add(nodeId);
            childToParentsMap.get(nodeId)?.forEach((child) => {
              expandedNodes.add(child);
            });

            return {
              sidebarRootId: prev.sidebarRootId,
              expandedNodes,
              implicitExpandedNodes,
            };
          }
        });
      },
      [nodeId]
    )
  );
};

export const SEARCH_DIALOG_OPEN_ATOM = atom(false);
SEARCH_DIALOG_OPEN_ATOM.debugLabel = "SEARCH_DIALOG_OPEN_ATOM";

export const MOBILE_SIDEBAR_OPEN_ATOM = atom(false);
MOBILE_SIDEBAR_OPEN_ATOM.debugLabel = "MOBILE_SIDEBAR_OPEN_ATOM";

export const DESKTOP_SIDEBAR_OPEN_ATOM = atom(false);
DESKTOP_SIDEBAR_OPEN_ATOM.debugLabel = "DESKTOP_SIDEBAR_OPEN_ATOM";

export const SIDEBAR_SCROLL_CONTAINER_ATOM = atom<HTMLElement | null>(null);
SIDEBAR_SCROLL_CONTAINER_ATOM.debugLabel = "SIDEBAR_SCROLL_CONTAINER_ATOM";

export const DISMISSABLE_SIDEBAR_OPEN_ATOM = atom(
  (get) => {
    const isMobileSidebarEnabled = get(MOBILE_SIDEBAR_ENABLED_ATOM);
    const isMobileScreen = get(IS_MOBILE_SCREEN_ATOM); // smallest screen size
    const isDesktopSidebarOpen = get(DESKTOP_SIDEBAR_OPEN_ATOM);
    const isMobileSidebarOpen = get(MOBILE_SIDEBAR_OPEN_ATOM);

    if (isMobileSidebarEnabled) {
      return isMobileSidebarOpen || (isDesktopSidebarOpen && !isMobileScreen);
    } else {
      return isDesktopSidebarOpen;
    }
  },
  (_get, set, update: boolean) => {
    set(DESKTOP_SIDEBAR_OPEN_ATOM, update);
    set(MOBILE_SIDEBAR_OPEN_ATOM, update);
  }
);
DISMISSABLE_SIDEBAR_OPEN_ATOM.debugLabel = "DISMISSABLE_SIDEBAR_OPEN_ATOM";

export const useDismissSidebar = (): (() => void) => {
  return useAtomCallback((_get, set) => {
    set(DISMISSABLE_SIDEBAR_OPEN_ATOM, false);
  });
};

export const FORCE_ENABLE_SIDEBAR_ATOM = atom((get) => {
  const isMobileSidebarEnabled = get(MOBILE_SIDEBAR_ENABLED_ATOM);

  if (isMobileSidebarEnabled) {
    return true;
  }

  const layout = get(DOCS_LAYOUT_ATOM);

  // sidebar is always enabled if the header is disabled
  if (layout?.disableHeader) {
    return true;
  }

  // sidebar is always enabled if vertical tabs are enabled
  if (layout?.tabsPlacement !== "HEADER") {
    return get(TABS_ATOM).length > 0;
  }

  return false;
});

export const DISABLE_SIDEBAR_ATOM = atom((get) => {
  if (get(FORCE_ENABLE_SIDEBAR_ATOM)) {
    return false;
  }
  const sidebar = get(SIDEBAR_ROOT_NODE_ATOM);

  if (sidebar == null) {
    return true;
  }

  // If there is only one pageGroup with only one page, hide the sidebar content
  // this is useful for tabs that only have one page
  if (
    sidebar.children.length === 1 &&
    sidebar.children[0] != null &&
    sidebar.children[0].type === "sidebarGroup" &&
    sidebar.children[0].children.length === 1 &&
    sidebar.children[0].children[0] != null &&
    sidebar.children[0].children[0].type === "page"
  ) {
    return true;
  }

  return false;
});

// in certain cases, the sidebar should be completely removed from the DOM.
export const SIDEBAR_DISMISSABLE_ATOM = atom((get) => {
  // sidebar is always enabled on mobile, because of search + tabs
  const isMobileSidebarEnabled = get(MOBILE_SIDEBAR_ENABLED_ATOM);
  if (isMobileSidebarEnabled) {
    return true;
  }

  const isForceEnableSidebar = get(FORCE_ENABLE_SIDEBAR_ATOM);
  if (isForceEnableSidebar) {
    return false;
  }

  const isSidebarDisabled = get(DISABLE_SIDEBAR_ATOM);
  if (isSidebarDisabled) {
    return true;
  }

  // always hide sidebar on changelog entries
  // this may be a bit too aggressive, but it's a good starting point
  const content = get(RESOLVED_PATH_ATOM);
  if (content.type === "changelog-entry") {
    return true;
  }

  if (content.type === "markdown-page" && typeof content.content !== "string") {
    const layout = content.content.frontmatter.layout;

    if (layout === "page" || layout === "custom") {
      return true;
    }
  }

  return false;
});
SIDEBAR_DISMISSABLE_ATOM.debugLabel = "SIDEBAR_DISMISSABLE_ATOM";

export function useMessageHandler(): void {
  useAtomEffect(
    useCallbackOne((get, set) => {
      if (typeof window === "undefined") {
        return;
      }
      const handleMessage = (event: MessageEvent) => {
        if (event.data === "openSearchDialog") {
          set(SEARCH_DIALOG_OPEN_ATOM, true);
          event.source?.postMessage("searchDialogOpened", {
            targetOrigin: event.origin,
          });
        } else if (event.data === "openMobileSidebar") {
          set(MOBILE_SIDEBAR_OPEN_ATOM, true);
          event.source?.postMessage("mobileSidebarOpened", {
            targetOrigin: event.origin,
          });
        } else if (event.data === "toggleTheme") {
          set(THEME_ATOM, get.peek(THEME_ATOM) === "dark" ? "light" : "dark");
          event.source?.postMessage("themeToggled", {
            targetOrigin: event.origin,
          });
        } else if (event.data === "setSystemTheme") {
          set(THEME_ATOM, "system");
          event.source?.postMessage("themeSetToSystem", {
            targetOrigin: event.origin,
          });
        }
      };
      window.addEventListener("message", handleMessage);
      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }, [])
  );
}

export function useIsSearchDialogOpen(): boolean {
  return useAtomValue(SEARCH_DIALOG_OPEN_ATOM);
}

export function useOpenSearchDialog(): () => void {
  const setSearchDialogState = useSetAtom(SEARCH_DIALOG_OPEN_ATOM);
  return useCallback(() => {
    setSearchDialogState(true);
  }, [setSearchDialogState]);
}

export function useCloseSearchDialog(): () => void {
  const setSearchDialogState = useSetAtom(SEARCH_DIALOG_OPEN_ATOM);
  return useCallback(() => {
    setSearchDialogState(false);
  }, [setSearchDialogState]);
}

export function useIsMobileSidebarOpen(): boolean {
  return useAtomValue(MOBILE_SIDEBAR_OPEN_ATOM);
}

export function useOpenMobileSidebar(): () => void {
  const setMobileSidebarState = useSetAtom(MOBILE_SIDEBAR_OPEN_ATOM);
  return useCallback(() => {
    setMobileSidebarState(true);
  }, [setMobileSidebarState]);
}

export function useCloseMobileSidebar(): () => void {
  const setMobileSidebarState = useSetAtom(MOBILE_SIDEBAR_OPEN_ATOM);
  return useCallback(() => {
    setMobileSidebarState(false);
  }, [setMobileSidebarState]);
}
