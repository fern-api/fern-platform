import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { SetStateAction, atom, useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { useCallbackOne, useMemoOne } from "use-memo-one";
import { useAtomEffect } from "./hooks";
import { DOCS_LAYOUT_ATOM } from "./layout";
import { CURRENT_NODE_ATOM, CURRENT_NODE_ID_ATOM, RESOLVED_PATH_ATOM, SIDEBAR_ROOT_NODE_ATOM } from "./navigation";
import { THEME_ATOM } from "./theme";
import { IS_MOBILE_SCREEN_ATOM, MOBILE_SIDEBAR_ENABLED_ATOM } from "./viewport";

export const SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM = atom((get) => {
    const sidebar = get(SIDEBAR_ROOT_NODE_ATOM);
    const childToParentsMap = new Map<FernNavigation.NodeId, FernNavigation.NodeId[]>();

    if (sidebar == null) {
        return childToParentsMap;
    }

    FernNavigation.utils.traverseNavigation(sidebar, (node, _index, parents) => {
        childToParentsMap.set(
            node.id,
            parents.map((p) => p.id),
        );
    });

    return childToParentsMap;
});
SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM.debugLabel = "SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM";

export const SIDEBAR_PARENT_TO_CHILDREN_MAP_ATOM = atom((get) => {
    const childToParentsMap = get(SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM);
    const parentToChildrenMap = new Map<FernNavigation.NodeId, FernNavigation.NodeId[]>();
    childToParentsMap.forEach((parents, child) => {
        parents.forEach((parentId) => {
            const children = parentToChildrenMap.get(parentId) ?? [];
            children.push(child);
            parentToChildrenMap.set(parentId, children);
        });
    });
    return parentToChildrenMap;
});
SIDEBAR_PARENT_TO_CHILDREN_MAP_ATOM.debugLabel = "SIDEBAR_PARENT_TO_CHILDREN_MAP_ATOM";

const INTERNAL_EXPANDED_SIDEBAR_NODES_ATOM = atom<{
    sidebarRootId: FernNavigation.NodeId;
    expandedNodes: FernNavigation.NodeId[];
}>({
    sidebarRootId: FernNavigation.NodeId(""),
    expandedNodes: [],
});

const INITIAL_EXPANDED_SIDEBAR_NODES_ATOM = atom((get) => {
    const expandedNodes = new Set<FernNavigation.NodeId>();
    const childToParentsMap = get(SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM);
    const currentNode = get(CURRENT_NODE_ATOM);
    if (currentNode != null) {
        expandedNodes.add(currentNode.id);
        childToParentsMap.get(currentNode.id)?.forEach((parent) => {
            expandedNodes.add(parent);
        });
    }
    // TODO: compute default expanded nodes
    // the following was commented out because FDR stores `collapsed: false` by default. Another solution is needed.
    // const sidebar = get(SIDEBAR_ROOT_NODE_ATOM);
    // if (sidebar != null) {
    //     FernNavigation.utils.traverseNavigation(sidebar, (node) => {
    //         // TODO: check for api reference, etc.
    //         if (node.type === "section" && node.collapsed === false) {
    //             expandedNodes.add(node.id);
    //         }
    //     });
    // }
    return [...expandedNodes];
});
INITIAL_EXPANDED_SIDEBAR_NODES_ATOM.debugLabel = "INITIAL_EXPANDED_SIDEBAR_NODES_ATOM";

export const EXPANDED_SIDEBAR_NODES_ATOM = atom(
    (get) => {
        const sidebar = get(SIDEBAR_ROOT_NODE_ATOM);
        const { expandedNodes: internalExpandedNodes, sidebarRootId } = get(INTERNAL_EXPANDED_SIDEBAR_NODES_ATOM);

        // when the sidebar changes, reset the expanded nodes to the initial state
        if (sidebarRootId !== sidebar?.id) {
            return new Set(get(INITIAL_EXPANDED_SIDEBAR_NODES_ATOM));
        }

        const childToParentsMap = get(SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM);
        const expandedNodes = new Set<FernNavigation.NodeId>();
        internalExpandedNodes.forEach((nodeId) => {
            expandedNodes.add(nodeId);
            childToParentsMap.get(nodeId)?.forEach((parent) => {
                expandedNodes.add(parent);
            });
        });
        const current = get(CURRENT_NODE_ATOM);
        if (current != null) {
            expandedNodes.add(current.id);
            childToParentsMap.get(current.id)?.forEach((parent) => {
                expandedNodes.add(parent);
            });
        }
        return expandedNodes;
    },
    (get, set, update: SetStateAction<FernNavigation.NodeId[]>) => {
        const sidebar = get(SIDEBAR_ROOT_NODE_ATOM);
        const internal = get(INTERNAL_EXPANDED_SIDEBAR_NODES_ATOM);

        // when the sidebar changes, reset the expanded nodes to the initial state
        if (internal.sidebarRootId !== sidebar?.id) {
            const expandedNodes = get(INITIAL_EXPANDED_SIDEBAR_NODES_ATOM);
            set(INTERNAL_EXPANDED_SIDEBAR_NODES_ATOM, {
                sidebarRootId: sidebar?.id ?? FernNavigation.NodeId(""),
                expandedNodes: typeof update === "function" ? update(expandedNodes) : update,
            });
        } else {
            // only update the expanded nodes that are still in the sidebar
            const nodes = get(SIDEBAR_CHILD_TO_PARENTS_MAP_ATOM);
            set(INTERNAL_EXPANDED_SIDEBAR_NODES_ATOM, (prev) => ({
                sidebarRootId: prev.sidebarRootId,
                expandedNodes: (typeof update === "function" ? update(prev.expandedNodes) : update).filter((nodeId) =>
                    nodes.has(nodeId),
                ),
            }));
        }
    },
);
EXPANDED_SIDEBAR_NODES_ATOM.debugLabel = "EXPANDED_SIDEBAR_NODES_ATOM";

export const useIsExpandedSidebarNode = (nodeId: FernNavigation.NodeId): boolean => {
    return useAtomValue(useMemoOne(() => atom((get) => get(EXPANDED_SIDEBAR_NODES_ATOM).has(nodeId)), [nodeId]));
};

export const useIsSelectedSidebarNode = (nodeId: FernNavigation.NodeId): boolean => {
    return useAtomValue(useMemoOne(() => atom((get) => nodeId === get(CURRENT_NODE_ID_ATOM)), [nodeId]));
};

export const useIsChildSelected = (parentId: FernNavigation.NodeId): boolean => {
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
                    return parentToChildrenMap.get(parentId)?.includes(selectedNodeId) ?? false;
                }),
            [parentId],
        ),
    );
};

export const useToggleExpandedSidebarNode = (nodeId: FernNavigation.NodeId): (() => void) => {
    return useAtomCallback(
        useCallbackOne(
            (get, set) => {
                const parentToChildrenMap = get(SIDEBAR_PARENT_TO_CHILDREN_MAP_ATOM);
                set(EXPANDED_SIDEBAR_NODES_ATOM, (prev) => {
                    if (prev.includes(nodeId)) {
                        // remove this node and all children from the expanded set
                        return prev.filter((id) => id !== nodeId && !parentToChildrenMap.get(nodeId)?.includes(id));
                    } else {
                        return [...prev, nodeId];
                    }
                });
            },
            [nodeId],
        ),
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
    },
);
DISMISSABLE_SIDEBAR_OPEN_ATOM.debugLabel = "DISMISSABLE_SIDEBAR_OPEN_ATOM";

export const useDismissSidebar = (): (() => void) => {
    return useAtomCallback((_get, set) => {
        set(DISMISSABLE_SIDEBAR_OPEN_ATOM, false);
    });
};

// in certain cases, the sidebar should be completely removed from the DOM.
export const SIDEBAR_DISMISSABLE_ATOM = atom((get) => {
    // sidebar is always enabled on mobile, because of search + tabs
    const isMobileSidebarEnabled = get(MOBILE_SIDEBAR_ENABLED_ATOM);
    if (isMobileSidebarEnabled) {
        return true;
    }

    // sidebar is always enabled if the header is disabled
    const layout = get(DOCS_LAYOUT_ATOM);
    if (layout?.disableHeader) {
        return false;
    }

    // sidebar is always enabled if vertical tabs are enabled
    if (layout?.tabsPlacement !== "HEADER") {
        return false;
    }

    // sidebar can be null when viewing a tabbed changelog
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

    // always hide sidebar on changelog entries
    // this may be a bit too aggressive, but it's a good starting point
    const resolvedPath = get(RESOLVED_PATH_ATOM);
    if (resolvedPath.type === "changelog-entry") {
        return true;
    }

    if (resolvedPath.type === "custom-markdown-page" && typeof resolvedPath.mdx !== "string") {
        const layout = resolvedPath.mdx.frontmatter.layout;

        if (layout === "page" || layout === "custom") {
            return true;
        }
    }

    const node = get(CURRENT_NODE_ATOM);

    if (node?.hidden) {
        return true;
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
                    event.source?.postMessage("searchDialogOpened", { targetOrigin: event.origin });
                } else if (event.data === "openMobileSidebar") {
                    set(MOBILE_SIDEBAR_OPEN_ATOM, true);
                    event.source?.postMessage("mobileSidebarOpened", { targetOrigin: event.origin });
                } else if (event.data === "toggleTheme") {
                    set(THEME_ATOM, get.peek(THEME_ATOM) === "dark" ? "light" : "dark");
                    event.source?.postMessage("themeToggled", { targetOrigin: event.origin });
                } else if (event.data === "setSystemTheme") {
                    set(THEME_ATOM, "system");
                    event.source?.postMessage("themeSetToSystem", { targetOrigin: event.origin });
                }
            };
            window.addEventListener("message", handleMessage);
            return () => {
                window.removeEventListener("message", handleMessage);
            };
        }, []),
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
