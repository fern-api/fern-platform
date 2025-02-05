import { FernNavigation } from "@fern-api/fdr-sdk";
import { CONTINUE, SKIP } from "@fern-api/fdr-sdk/traversers";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithReducer } from "jotai/utils";
import React from "react";
import { useMemoOne } from "use-memo-one";

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

const EMPTY_EXPANDED_NODES_STATE: ExpandedNodesState = {
  expandedNodes: new Set(),
  implicitExpandedNodes: new Set(),
  childToParentsMap: new Map(),
};

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

export const rootNodeAtom = atom<FernNavigation.RootNode | undefined>(
  undefined
);

export const apiReferenceNodesAtom = atom<
  ReadonlyMap<FernNavigation.ApiDefinitionId, FernNavigation.ApiReferenceNode>
>((get) => {
  const root = get(rootNodeAtom);
  if (root == null) {
    return new Map();
  }
  const apiReferenceNodes = new Map<
    FernNavigation.ApiDefinitionId,
    FernNavigation.ApiReferenceNode
  >();
  FernNavigation.traverseBF(root, (node) => {
    if (node.type === "apiReference") {
      apiReferenceNodes.set(node.apiDefinitionId, node);
      return SKIP;
    }
    return CONTINUE;
  });
  return apiReferenceNodes;
});

export const foundNodeAtom = atom<FernNavigation.utils.Node.Found | undefined>(
  undefined
);

export const currentNodeIdAtom = atom<FernNavigation.NodeId | undefined>(
  (get) => get(foundNodeAtom)?.node.id
);

export function atomWithNavigationRootNode(
  initialNodeId?: FernNavigation.NodeId,
  root?: FernNavigation.RootNode
) {
  const sidebarRootNodes = getAllSidebarRootNodes(root);
  const sidebarRootNodeIdToChildToParentsMap =
    getSidebarRootNodeIdToChildToParentsMap(sidebarRootNodes);
  return atomWithReducer(
    createInitialExpandedNodesBySidebarRootId(initialNodeId, sidebarRootNodes),
    (
      prev,
      {
        sidebarRootNodeId,
        ...action
      }: SidebarAction & { sidebarRootNodeId: FernNavigation.NodeId }
    ) => {
      return reduceExpandedNodesBySidebarRootId(
        prev,
        action,
        sidebarRootNodeIdToChildToParentsMap,
        sidebarRootNodeId
      );
    }
  );
}

export function atomWithSidebarRootNode(
  parentAtom?: ReturnType<typeof atomWithNavigationRootNode>,
  sidebarRootNodeId?: FernNavigation.NodeId | undefined
) {
  return atom(
    (get) => {
      if (sidebarRootNodeId == null || parentAtom == null) {
        return EMPTY_EXPANDED_NODES_STATE;
      }
      return (
        get(parentAtom).get(sidebarRootNodeId) ?? EMPTY_EXPANDED_NODES_STATE
      );
    },
    (_get, set, update: SidebarAction) => {
      if (sidebarRootNodeId && parentAtom) {
        set(parentAtom, { ...update, sidebarRootNodeId });
      }
    }
  );
}

export const AllSidebarExpandedNodesAtomContext = React.createContext<
  ReturnType<typeof atomWithNavigationRootNode>
>(atomWithNavigationRootNode());

export const SidebarExpandedNodesAtomContext = React.createContext<
  ReturnType<typeof atomWithSidebarRootNode>
>(atomWithSidebarRootNode());

export function useIsSelectedSidebarNode(
  nodeId: FernNavigation.NodeId
): boolean {
  return useAtomValue(
    useMemoOne(() => atom((get) => get(currentNodeIdAtom) === nodeId), [nodeId])
  );
}

export function useToggleExpandedSidebarNode(nodeId: FernNavigation.NodeId) {
  const expandedNodesAtom = React.useContext(SidebarExpandedNodesAtomContext);
  const sendAction = useSetAtom(expandedNodesAtom);
  return () => {
    sendAction({ type: "toggle", nodeId });
  };
}

export function useIsChildSelected(parentId: FernNavigation.NodeId) {
  const expandedNodesAtom = React.useContext(SidebarExpandedNodesAtomContext);

  return useAtomValue(
    useMemoOne(
      () =>
        atom((get) => {
          const selectedNodeId = get(currentNodeIdAtom);
          if (selectedNodeId === parentId) {
            return true;
          } else if (selectedNodeId == null) {
            return false;
          }

          const parentToChildrenMap = invertParentChildMap(
            get(expandedNodesAtom).childToParentsMap
          );
          return (
            parentToChildrenMap.get(parentId)?.includes(selectedNodeId) ?? false
          );
        }),
      [parentId, expandedNodesAtom]
    )
  );
}

export function useIsExpandedSidebarNode(nodeId: FernNavigation.NodeId) {
  const expandedNodesAtom = React.useContext(SidebarExpandedNodesAtomContext);
  return useAtomValue(
    useMemoOne(
      () =>
        atom((get) => {
          const { expandedNodes, implicitExpandedNodes } =
            get(expandedNodesAtom);
          return expandedNodes.has(nodeId) || implicitExpandedNodes.has(nodeId);
        }),
      [nodeId, expandedNodesAtom]
    )
  );
}

export function useIsApiReferenceShallowLink(
  node: FernNavigation.WithApiDefinitionId
): boolean {
  return useAtomValue(
    useMemoOne(
      () =>
        atom(
          (get) =>
            get(apiReferenceNodesAtom).get(node.apiDefinitionId)?.paginated ??
            false
        ),
      [node.apiDefinitionId]
    )
  );
}
