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
const currentVersionIdAtom = atom<FernNavigation.NodeId | undefined>(undefined);
const currentVersionSlugAtom = atom<FernNavigation.Slug | undefined>(undefined);

export function useCurrentSidebarRootNodeId() {
  return useAtomValue(currentSidebarRootNodeIdAtom);
}

export function useCurrentNodeId() {
  return useAtomValue(currentNodeIdAtom);
}

export function useCurrentTabId() {
  return useAtomValue(currentTabIdAtom);
}

export function useCurrentVersionId() {
  return useAtomValue(currentVersionIdAtom);
}

export function useCurrentVersionSlug() {
  return useAtomValue(currentVersionSlugAtom);
}

export function SetCurrentNavigationNode({
  sidebarRootNodeId,
  nodeId,
  tabId,
  versionId,
  versionSlug,
}: {
  sidebarRootNodeId?: FernNavigation.NodeId;
  nodeId?: FernNavigation.NodeId;
  tabId?: FernNavigation.NodeId;
  versionId?: FernNavigation.NodeId;
  versionSlug?: FernNavigation.Slug;
}) {
  const useStore = React.useContext(RootNodeStoreContext);
  const dispatch = useStore((s) => s.dispatch);
  const setCurrentSidebarRootNodeId = useSetAtom(currentSidebarRootNodeIdAtom);
  const setCurrentNodeId = useSetAtom(currentNodeIdAtom);
  const setCurrentTabId = useSetAtom(currentTabIdAtom);
  const setCurrentVersionId = useSetAtom(currentVersionIdAtom);
  const setCurrentVersionSlug = useSetAtom(currentVersionSlugAtom);

  useIsomorphicLayoutEffect(() => {
    setCurrentSidebarRootNodeId(sidebarRootNodeId);
    setCurrentNodeId(nodeId);
    setCurrentTabId(tabId);
    setCurrentVersionId(versionId);
    setCurrentVersionSlug(versionSlug);
  }, [nodeId, tabId, sidebarRootNodeId, versionId, versionSlug]);

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
      <PathnameDispatcher />
      {children}
    </RootNodeStoreContext.Provider>
  );
}

export function PathnameDispatcher() {
  const currentNodeId = useCurrentNodeId();
  const currentSidebarRootNodeId = useCurrentSidebarRootNodeId();
  const useStore = React.useContext(RootNodeStoreContext);
  const dispatch = useStore((s) => s.dispatch);
  useIsomorphicLayoutEffect(() => {
    if (currentNodeId == null || currentSidebarRootNodeId == null) {
      return;
    }
    dispatch(
      { type: "expand", nodeId: currentNodeId },
      currentSidebarRootNodeId
    );
  }, [currentNodeId, currentSidebarRootNodeId]);
  return null;
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

  if (actionType === "expand" || actionType === "expand-soft") {
    const expandedNodes = new Set(prev.expandedNodes);
    const implicitExpandedNodes = new Set(prev.implicitExpandedNodes);

    if (actionType === "expand-soft") {
      implicitExpandedNodes.add(action.nodeId);
    } else {
      expandedNodes.add(action.nodeId);
    }

    prev.childToParentsMap.get(action.nodeId)?.forEach((parent) => {
      implicitExpandedNodes.add(parent);
    });

    return {
      expandedNodes,
      implicitExpandedNodes,
      childToParentsMap: prev.childToParentsMap,
    };
  }

  if (actionType === "collapse") {
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
