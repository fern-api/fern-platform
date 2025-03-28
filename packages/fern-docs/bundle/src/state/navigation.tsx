"use client";

import React from "react";

import { atom, useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { StoreApi, UseBoundStore, create } from "zustand";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { useIsomorphicLayoutEffect, useLazyRef } from "@fern-ui/react-commons";

import {
  ExpandedNodesState,
  createInitialExpandedNodes,
  invertParentChildMap,
} from "./navigation-server";

type SidebarAction =
  | { type: "toggle"; nodeId: FernNavigation.NodeId }
  | { type: "expand"; nodeId: FernNavigation.NodeId }
  | { type: "expand-soft"; nodeId: FernNavigation.NodeId }
  | { type: "collapse"; nodeId: FernNavigation.NodeId }
  | { type: "reset"; currentNodeId: FernNavigation.NodeId | undefined }
  | { type: "collapse-all" }
  | { type: "expand-all" }
  | { type: "reset-implicit" };

type RootNodeState = {
  state: ReadonlyMap<FernNavigation.NodeId, ExpandedNodesState>;
  dispatch: (
    action: SidebarAction,
    currentSidebarRootNodeId: FernNavigation.NodeId
  ) => void;
};

export function createRootNodeStore(
  sidebarRootNodeToChildToParentsMap: ReadonlyMap<
    FernNavigation.NodeId,
    ReadonlyMap<FernNavigation.NodeId, FernNavigation.NodeId[]>
  >
) {
  return create<RootNodeState>((set) => ({
    state: new Map(),
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

const basepathAtom = atom<string>("");

export function useBasePath() {
  return useAtomValue(basepathAtom);
}

export function SetBasePath({ value }: { value: string }) {
  useHydrateAtoms([[basepathAtom, value]], {
    dangerouslyForceHydrate: true,
  });
  return null;
}

const RootNodeStoreContext = React.createContext<
  UseBoundStore<StoreApi<RootNodeState>>
>(createRootNodeStore(new Map()));

const currentSidebarRootNodeIdAtom = atom<FernNavigation.NodeId | undefined>(
  undefined
);
const currentNodeIdAtom = atom<FernNavigation.NodeId | undefined>(undefined);
const currentTabIdAtom = atom<FernNavigation.NodeId | undefined>(undefined);
const currentProductIdAtom = atom<FernNavigation.ProductId | undefined>(
  undefined
);
const currentVersionIdAtom = atom<FernNavigation.VersionId | undefined>(
  undefined
);
const currentProductSlugAtom = atom<FernNavigation.Slug | undefined>(undefined);
const currentVersionSlugAtom = atom<FernNavigation.Slug | undefined>(undefined);

// if true, the current version is the default version
const currentVersionIsDefaultAtom = atom<boolean>(false);

export function useCurrentSidebarRootNodeId() {
  return useAtomValue(currentSidebarRootNodeIdAtom);
}

export function useCurrentNodeId() {
  return useAtomValue(currentNodeIdAtom);
}

export function useCurrentTabId() {
  return useAtomValue(currentTabIdAtom);
}

export function useCurrentProductId() {
  return useAtomValue(currentProductIdAtom);
}

export function useCurrentProductSlug() {
  return useAtomValue(currentProductSlugAtom);
}

export function useCurrentVersionId() {
  return useAtomValue(currentVersionIdAtom);
}

export function useCurrentVersionSlug() {
  return useAtomValue(currentVersionSlugAtom);
}

export function useCurrentVersionIsDefault() {
  return useAtomValue(currentVersionIsDefaultAtom);
}

export function SetCurrentNavigationNode({
  sidebarRootNodeId,
  nodeId,
  tabId,
  productId,
  productSlug,
  versionId,
  versionSlug,
  versionIsDefault,
}: {
  sidebarRootNodeId?: FernNavigation.NodeId;
  nodeId?: FernNavigation.NodeId;
  tabId?: FernNavigation.NodeId;
  productId?: FernNavigation.ProductId;
  productSlug?: FernNavigation.Slug;
  versionId?: FernNavigation.VersionId;
  versionSlug?: FernNavigation.Slug;
  versionIsDefault?: boolean;
}) {
  const useStore = React.useContext(RootNodeStoreContext);
  const dispatch = useStore((s) => s.dispatch);
  const setCurrentSidebarRootNodeId = useSetAtom(currentSidebarRootNodeIdAtom);
  const setCurrentNodeId = useSetAtom(currentNodeIdAtom);
  const setCurrentTabId = useSetAtom(currentTabIdAtom);
  const setCurrentProductId = useSetAtom(currentProductIdAtom);
  const setCurrentProductSlug = useSetAtom(currentProductSlugAtom);
  const setCurrentVersionId = useSetAtom(currentVersionIdAtom);
  const setCurrentVersionSlug = useSetAtom(currentVersionSlugAtom);
  const setCurrentVersionIsDefault = useSetAtom(currentVersionIsDefaultAtom);
  useIsomorphicLayoutEffect(() => {
    setCurrentSidebarRootNodeId(sidebarRootNodeId);
    setCurrentNodeId(nodeId);
    setCurrentProductId(productId);
    setCurrentProductSlug(productSlug);
    setCurrentTabId(tabId);
    setCurrentVersionId(versionId);
    setCurrentVersionSlug(versionSlug);
    setCurrentVersionIsDefault(versionIsDefault ?? false);
  }, [
    nodeId,
    tabId,
    sidebarRootNodeId,
    productId,
    productSlug,
    versionId,
    versionSlug,
    versionIsDefault,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (nodeId && sidebarRootNodeId) {
      dispatch({ type: "expand-soft", nodeId }, sidebarRootNodeId);
    }
  }, [nodeId, sidebarRootNodeId]);

  return null;
}

export function useIsSelectedSidebarNode(nodeId: FernNavigation.NodeId) {
  const currentNodeId = useCurrentNodeId();
  return currentNodeId === nodeId;
}

export function useIsExpanded(nodeId: FernNavigation.NodeId) {
  const rootNodeId = useCurrentSidebarRootNodeId();
  const useStore = React.useContext(RootNodeStoreContext);
  const state = useStore((s) => {
    if (rootNodeId == null) {
      return false;
    }
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
  const rootNodeId = useCurrentSidebarRootNodeId();
  const currentNodeId = useCurrentNodeId();
  const useStore = React.useContext(RootNodeStoreContext);
  const state = useStore((s) => {
    if (rootNodeId == null || currentNodeId == null) {
      return false;
    }
    const expandedState = s.state.get(rootNodeId);
    if (expandedState == null) {
      return false;
    }
    if (currentNodeId === nodeId) {
      return true;
    }

    const parentToChildrenMap = invertParentChildMap(
      expandedState.childToParentsMap
    );
    return parentToChildrenMap.get(nodeId)?.includes(currentNodeId) ?? false;
  });
  return state;
}

export function useDispatchSidebarAction() {
  const store = React.useContext(RootNodeStoreContext);
  const currentSidebarRootNodeId = useCurrentSidebarRootNodeId();
  const dispatch = store((s) => s.dispatch);
  return (action: SidebarAction) => {
    if (currentSidebarRootNodeId == null) {
      return;
    }
    dispatch(action, currentSidebarRootNodeId);
  };
}

export function useToggleSidebarNode(nodeId: FernNavigation.NodeId) {
  const dispatch = useDispatchSidebarAction();
  return () => dispatch({ type: "toggle", nodeId });
}

export function RootNodeProvider({
  children,
  sidebarRootNodesToChildToParentsMap,
}: {
  children: React.ReactNode;
  sidebarRootNodesToChildToParentsMap: ReadonlyMap<
    FernNavigation.NodeId,
    ReadonlyMap<FernNavigation.NodeId, FernNavigation.NodeId[]>
  >;
}) {
  const store = useLazyRef(() =>
    createRootNodeStore(sidebarRootNodesToChildToParentsMap)
  );
  return (
    <RootNodeStoreContext.Provider value={store.current}>
      {children}
    </RootNodeStoreContext.Provider>
  );
}

const EMPTY_EXPANDED_NODES_STATE: ExpandedNodesState = {
  expandedNodes: new Set(),
  implicitExpandedNodes: new Set(),
  collapsedNodes: new Set(),
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
      collapsedNodes: new Set(),
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
      collapsedNodes: new Set(),
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

  if (actionType === "expand" || actionType === "expand-soft") {
    const expandedNodes = new Set(prev.expandedNodes);
    const implicitExpandedNodes = new Set<FernNavigation.NodeId>();
    const collapsedNodes = new Set(prev.collapsedNodes);

    collapsedNodes.delete(action.nodeId);

    if (actionType === "expand-soft") {
      implicitExpandedNodes.add(action.nodeId);
    } else {
      expandedNodes.add(action.nodeId);
    }

    prev.childToParentsMap.get(action.nodeId)?.forEach((parent) => {
      implicitExpandedNodes.add(parent);
    });

    prev.expandedNodes.forEach((nodeId) => {
      const parents = prev.childToParentsMap.get(nodeId);
      if (parents == null) {
        return;
      }
      for (const parent of parents) {
        if (collapsedNodes.has(parent)) {
          break;
        }
        implicitExpandedNodes.add(parent);
      }
    });

    return {
      expandedNodes,
      implicitExpandedNodes,
      collapsedNodes,
      childToParentsMap: prev.childToParentsMap,
    };
  }

  if (actionType === "collapse") {
    const expandedNodes = new Set(prev.expandedNodes);
    const implicitExpandedNodes = new Set(prev.implicitExpandedNodes);
    const collapsedNodes = new Set(prev.collapsedNodes);
    // remove this node and all children from the expanded set
    expandedNodes.delete(action.nodeId);
    implicitExpandedNodes.delete(action.nodeId);
    collapsedNodes.add(action.nodeId);
    return {
      expandedNodes,
      implicitExpandedNodes,
      collapsedNodes,
      childToParentsMap: prev.childToParentsMap,
    };
  }

  return prev;
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
