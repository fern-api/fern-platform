"use client";

import { usePathname } from "next/navigation";
import React from "react";

import { StoreApi, UseBoundStore, create } from "zustand";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { CONTINUE, SKIP } from "@fern-api/fdr-sdk/traversers";
import { useLazyRef } from "@fern-ui/react-commons";

type SidebarAction =
  | { type: "toggle"; nodeId: FernNavigation.NodeId }
  | { type: "expand"; nodeId: FernNavigation.NodeId }
  | { type: "expand-soft"; nodeId: FernNavigation.NodeId }
  | { type: "collapse"; nodeId: FernNavigation.NodeId }
  | { type: "reset"; currentNodeId: FernNavigation.NodeId | undefined }
  | { type: "collapse-all" }
  | { type: "expand-all" }
  | { type: "reset-implicit" };

/**
 * The state of the expanded nodes for a sidebar root node
 */
interface ExpandedNodesState {
  expandedNodes: ReadonlySet<FernNavigation.NodeId>;
  implicitExpandedNodes: ReadonlySet<FernNavigation.NodeId>;
  childToParentsMap: ReadonlyMap<
    FernNavigation.NodeId,
    FernNavigation.NodeId[]
  >;
}

type RootNodeState = {
  root: FernNavigation.RootNode | undefined;
  collector: FernNavigation.NodeCollector;
  state: ReadonlyMap<FernNavigation.NodeId, ExpandedNodesState>;
  dispatch: (
    action: SidebarAction,
    currentSidebarRootNodeId: FernNavigation.NodeId
  ) => void;
};

export function createRootNodeStore(
  root?: FernNavigation.RootNode,
  pathname?: string
) {
  const collector = FernNavigation.NodeCollector.collect(root);
  const sidebarRootNodes = getAllSidebarRootNodes(root);
  const initialExpandedNodes = createInitialExpandedNodesBySidebarRootId(
    collector.getSlugMapWithParents().get(FernNavigation.slugjoin(pathname))
      ?.node?.id,
    sidebarRootNodes
  );
  const sidebarRootNodeToChildToParentsMap =
    getSidebarRootNodeIdToChildToParentsMap(sidebarRootNodes);
  return create<RootNodeState>((set) => ({
    root,
    collector,
    state: initialExpandedNodes,
    dispatch: (
      action: SidebarAction,
      currentSidebarRootNodeId: FernNavigation.NodeId
    ) =>
      set(({ state }) => ({
        state: reduceExpandedNodesBySidebarRootId(
          state,
          action,
          sidebarRootNodeToChildToParentsMap,
          currentSidebarRootNodeId
        ),
      })),
  }));
}

const RootNodeStoreContext = React.createContext<
  UseBoundStore<StoreApi<RootNodeState>>
>(createRootNodeStore());

export function useRootNode() {
  const store = React.useContext(RootNodeStoreContext);
  return store((s) => s.root);
}

export function useNodeCollector() {
  const store = React.useContext(RootNodeStoreContext);
  return store((s) => s.collector);
}

export function useNode() {
  const pathname = usePathname();
  const collector = useNodeCollector();
  const withParents = collector
    .getSlugMapWithParents()
    .get(FernNavigation.slugjoin(pathname));

  return {
    next: withParents?.next,
    prev: withParents?.prev,
    current: withParents?.node,
    parents: withParents?.parents,
  };
}

export function useIsSelectedSidebarNode(nodeId: FernNavigation.NodeId) {
  const { current } = useNode();
  return current?.id === nodeId;
}

export function useCurrentTab() {
  const { parents, current } = useNode();
  if (current?.type === "tab") {
    return current;
  }
  return parents?.find((parent) => parent.type === "tab");
}

export function useTabs() {
  const { parents } = useNode();
  return parents?.find((parent) => parent.type === "tabbed")?.children;
}

export function useCurrentVersion() {
  const { parents, current } = useNode();
  if (current?.type === "version") {
    return current;
  }
  return parents?.find((parent) => parent.type === "version");
}

export function useCurrentSidebarRoot() {
  const { parents } = useNode();
  return parents?.find((parent) => parent.type === "sidebarRoot");
}

export function useIsExpanded(nodeId: FernNavigation.NodeId) {
  const rootNodeId = useCurrentSidebarRoot()?.id;
  const store = React.useContext(RootNodeStoreContext);
  if (rootNodeId == null) {
    return false;
  }
  const state = store((s) => {
    const expandedState = s.state.get(rootNodeId);
    if (expandedState == null) {
      return false;
    }
    return (
      expandedState.expandedNodes.has(nodeId) ||
      expandedState.implicitExpandedNodes.has(nodeId)
    );
  });
  return state;
}

export function useIsChildSelected(nodeId: FernNavigation.NodeId) {
  const rootNodeId = useCurrentSidebarRoot()?.id;
  const { current } = useNode();
  const store = React.useContext(RootNodeStoreContext);
  if (rootNodeId == null || current == null) {
    return false;
  }
  const state = store((s) => {
    const expandedState = s.state.get(rootNodeId);
    if (expandedState == null) {
      return false;
    }
    if (current.id === nodeId) {
      return true;
    }

    const parentToChildrenMap = invertParentChildMap(
      expandedState.childToParentsMap
    );
    return parentToChildrenMap.get(nodeId)?.includes(current.id) ?? false;
  });
  return state;
}

export function useDispatchSidebarAction() {
  const store = React.useContext(RootNodeStoreContext);
  const currentSidebarRoot = useCurrentSidebarRoot();
  const dispatch = store((s) => s.dispatch);
  return (action: SidebarAction) => {
    if (currentSidebarRoot == null) {
      return;
    }
    dispatch(action, currentSidebarRoot.id);
  };
}

export function useToggleSidebarNode(nodeId: FernNavigation.NodeId) {
  const dispatch = useDispatchSidebarAction();
  return () => dispatch({ type: "toggle", nodeId });
}

export function RootNodeProvider({
  children,
  root,
}: {
  children: React.ReactNode;
  root: FernNavigation.RootNode;
}) {
  const pathname = usePathname();
  const store = useLazyRef(() => createRootNodeStore(root, pathname));
  return (
    <RootNodeStoreContext.Provider value={store.current}>
      <PathnameDispatcher />
      {children}
    </RootNodeStoreContext.Provider>
  );
}

export function PathnameDispatcher() {
  const { current } = useNode();
  const sidebarRootNodeId = useCurrentSidebarRoot()?.id;
  const useStore = React.useContext(RootNodeStoreContext);
  const dispatch = useStore((s) => s.dispatch);
  React.useEffect(() => {
    if (current == null || sidebarRootNodeId == null) {
      return;
    }
    dispatch({ type: "expand", nodeId: current.id }, sidebarRootNodeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, sidebarRootNodeId]);
  return null;
}

/**
 * Get the child to parents map for a sidebar root node
 * @param sidebar - The sidebar root node
 * @returns The child to parents map
 */
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

/**
 * Invert a parent to child map
 * @param parentChildMap - The parent to child map
 * @returns The child to parent map
 */
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

/**
 * Create the initial expanded nodes for a sidebar root node
 * @param currentNodeId - The current node id
 * @param childToParentsMap - The child to parents map
 * @returns The initial expanded nodes state
 */
function createInitialExpandedNodes(
  currentNodeId: FernNavigation.NodeId | undefined,
  childToParentsMap: ReadonlyMap<FernNavigation.NodeId, FernNavigation.NodeId[]>
): ExpandedNodesState {
  const expandedNodes = new Set<FernNavigation.NodeId>();
  const implicitExpandedNodes = new Set<FernNavigation.NodeId>();

  if (currentNodeId != null) {
    expandedNodes.add(currentNodeId);
    childToParentsMap.get(currentNodeId)?.forEach((parent) => {
      implicitExpandedNodes.add(parent);
    });
  }

  return { expandedNodes, implicitExpandedNodes, childToParentsMap };
}

const EMPTY_EXPANDED_NODES_STATE: ExpandedNodesState = {
  expandedNodes: new Set(),
  implicitExpandedNodes: new Set(),
  childToParentsMap: new Map(),
};

/**
 * Reduce the expanded nodes for a sidebar root node
 * @param prev - The previous expanded nodes state
 * @param action - The action to perform
 * @param childToParentsMap - The child to parents map
 * @returns The new expanded nodes state
 */
function reduceExpandedNodes(
  prev: ExpandedNodesState,
  action: SidebarAction
): ExpandedNodesState {
  if (action.type === "reset") {
    return createInitialExpandedNodes(
      action.currentNodeId,
      prev.childToParentsMap
    );
  }

  if (action.type === "collapse-all") {
    return EMPTY_EXPANDED_NODES_STATE;
  }

  if (action.type === "expand-all") {
    return {
      expandedNodes: new Set(
        invertParentChildMap(prev.childToParentsMap).keys()
      ),
      implicitExpandedNodes: new Set(),
      childToParentsMap: prev.childToParentsMap,
    };
  }

  if (action.type === "reset-implicit") {
    const implicitExpandedNodes = new Set<FernNavigation.NodeId>();
    prev.expandedNodes.forEach((nodeId) => {
      prev.childToParentsMap.get(nodeId)?.forEach((parent) => {
        implicitExpandedNodes.add(parent);
      });
    });
    return {
      expandedNodes: prev.expandedNodes,
      implicitExpandedNodes,
      childToParentsMap: prev.childToParentsMap,
    };
  }

  const isExpanded =
    prev.expandedNodes.has(action.nodeId) ||
    prev.implicitExpandedNodes.has(action.nodeId);

  const actionType: "expand" | "collapse" | "expand-soft" =
    action.type === "toggle"
      ? isExpanded
        ? "collapse"
        : "expand"
      : action.type;

  if (
    (actionType === "expand" || actionType === "expand-soft") &&
    !isExpanded
  ) {
    const expandedNodes = new Set(prev.expandedNodes);
    const implicitExpandedNodes = new Set(prev.implicitExpandedNodes);
    // add this node and all children to the expanded set
    expandedNodes.add(action.nodeId);
    prev.childToParentsMap.get(action.nodeId)?.forEach((parent) => {
      if (actionType === "expand-soft") {
        implicitExpandedNodes.add(parent);
      } else {
        expandedNodes.add(parent);
      }
    });
    return {
      expandedNodes,
      implicitExpandedNodes,
      childToParentsMap: prev.childToParentsMap,
    };
  }

  if (actionType === "collapse" && isExpanded) {
    const expandedNodes = new Set(prev.expandedNodes);
    const implicitExpandedNodes = new Set(prev.implicitExpandedNodes);
    // remove this node and all children from the expanded set
    expandedNodes.delete(action.nodeId);
    implicitExpandedNodes.delete(action.nodeId);
    return {
      expandedNodes,
      implicitExpandedNodes,
      childToParentsMap: prev.childToParentsMap,
    };
  }

  return prev;
}

function getSidebarRootNodeIdToChildToParentsMap(
  sidebarRootNodes: ReadonlyMap<
    FernNavigation.NodeId,
    FernNavigation.SidebarRootNode
  >
): ReadonlyMap<
  FernNavigation.NodeId,
  ReadonlyMap<FernNavigation.NodeId, FernNavigation.NodeId[]>
> {
  return new Map(
    Array.from(sidebarRootNodes.values()).map((sidebarRootNode) => {
      return [
        sidebarRootNode.id,
        getNavigationChildToParentsMap(sidebarRootNode),
      ];
    })
  );
}
/**
 * Get all the sidebar root nodes in a root node
 * @param root - The root node
 * @returns The sidebar root nodes
 */
function getAllSidebarRootNodes(
  root: FernNavigation.RootNode | undefined
): ReadonlyMap<FernNavigation.NodeId, FernNavigation.SidebarRootNode> {
  if (root == null) {
    return new Map();
  }
  const sidebarRootNodes = new Map<
    FernNavigation.NodeId,
    FernNavigation.SidebarRootNode
  >();
  FernNavigation.traverseBF(root, (node) => {
    if (node.type === "sidebarRoot") {
      sidebarRootNodes.set(node.id, node);
      return SKIP;
    }
    return CONTINUE;
  });
  return sidebarRootNodes;
}

/**
 * Create the initial expanded nodes for a sidebar root node
 * @param currentNodeId - The current node id
 * @param sidebarRootNodes - The sidebar root nodes
 * @returns The initial expanded nodes state
 */
function createInitialExpandedNodesBySidebarRootId(
  currentNodeId: FernNavigation.NodeId | undefined,
  sidebarRootNodes: ReadonlyMap<
    FernNavigation.NodeId,
    FernNavigation.SidebarRootNode
  >
): ReadonlyMap<FernNavigation.NodeId, ExpandedNodesState> {
  return new Map(
    Array.from(sidebarRootNodes.values()).map((sidebarRootNode) => {
      return [
        sidebarRootNode.id,
        createInitialExpandedNodes(
          currentNodeId,
          getNavigationChildToParentsMap(sidebarRootNode)
        ),
      ];
    })
  );
}

/**
 * Reduce the expanded nodes for a sidebar root node
 * @param prev - The previous expanded nodes state
 * @param action - The action to perform
 * @param sidebarRootNodeIdToChildToParentsMap - The sidebar root node id to child to parents map
 * @param currentSidebarRootNodeId - The current sidebar root node id
 * @returns The new expanded nodes state
 */
function reduceExpandedNodesBySidebarRootId(
  prev: ReadonlyMap<FernNavigation.NodeId, ExpandedNodesState>,
  action: SidebarAction,
  sidebarRootNodeIdToChildToParentsMap: ReadonlyMap<
    FernNavigation.NodeId,
    ReadonlyMap<FernNavigation.NodeId, FernNavigation.NodeId[]>
  >,
  currentSidebarRootNodeId: FernNavigation.NodeId
): ReadonlyMap<FernNavigation.NodeId, ExpandedNodesState> {
  const childToParentsMap = sidebarRootNodeIdToChildToParentsMap.get(
    currentSidebarRootNodeId
  );

  if (childToParentsMap == null) {
    return prev;
  }

  const next = new Map(prev);
  next.set(
    currentSidebarRootNodeId,
    reduceExpandedNodes(
      prev.get(currentSidebarRootNodeId) ??
        createInitialExpandedNodes(undefined, childToParentsMap),
      action
    )
  );
  return next;
}
