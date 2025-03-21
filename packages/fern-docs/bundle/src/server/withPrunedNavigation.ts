import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { DocsLoader } from "./docs-loader";

interface WithPrunedSidebarOpts {
  /**
   * If provided, hidden nodes in this list will not be pruned
   */
  visibleNodeIds?: FernNavigation.NodeId[];

  /**
   * If true, authenticated pages will not be pruned
   */
  authed: boolean;

  /**
   * If true, authenticated pages will not be pruned because they are discoverable
   */
  discoverable?: true;
}

/**
 * This function checks if a node is visible by traversing the node and all its children.
 * If current node or any of its children are in the set of visible node ids, the node is visible.
 *
 * @param node the node to check
 * @param visibleNodeIds the set of node ids that are visible
 * @returns true if the node is visible, false otherwise
 */
function isVisible(
  node: FernNavigation.NavigationNode,
  visibleNodeIds: Set<FernNavigation.NodeId>
): boolean {
  let visible = false;

  if (visibleNodeIds.size === 0) {
    return visible;
  }

  if (visibleNodeIds.has(node.id)) {
    visible = true;
  }

  FernNavigation.traverseBF(node, (node) => {
    if (visibleNodeIds.has(node.id)) {
      visible = true;
      return false;
    }
    return true;
  });

  return visible;
}

/**
 * Note: at the stage of calling this function, the RBAC should already been evaluated (and nodes are completely filtered out that are not visible to the current user).
 * @returns true if the node should be included, false otherwise
 */
export function pruneNavigationPredicate(
  node: FernNavigation.NavigationNode,
  { visibleNodeIds, authed, discoverable }: WithPrunedSidebarOpts
): boolean | "force" {
  // prune authenticated pages (unless the discoverable flag is turned on)
  if (FernNavigation.isPage(node) && node.authed && !authed && !discoverable) {
    return false;
  }

  // then, prune hidden nodes, unless it is the current node
  if (FernNavigation.hasMetadata(node) && node.hidden) {
    if (isVisible(node, new Set(visibleNodeIds))) {
      return false;
    }
    return "force";
  }

  // finally, prune nodes that are not pages and have no children (avoid pruning links)
  if (!FernNavigation.isPage(node) && !FernNavigation.isLeaf(node)) {
    return FernNavigation.getChildren(node).length > 0;
  }

  return true;
}

export function withPrunedNavigation<
  NODE extends FernNavigation.NavigationNode,
>(node: NODE | undefined, opts: WithPrunedSidebarOpts): NODE | undefined {
  if (!node) {
    return node;
  }

  return FernNavigation.Pruner.from(node)
    .keep((n) => pruneNavigationPredicate(n, opts))
    .get();
}

export async function withPrunedNavigationLoader<
  NODE extends FernNavigation.NavigationNode,
>(
  node: NODE | undefined,
  loader: DocsLoader,
  visibleNodeIds: FernNavigation.NodeId[] | undefined
): Promise<NODE | undefined> {
  return withPrunedNavigation(node, {
    visibleNodeIds,
    authed: (await loader.getAuthState()).authed,
    // when true, all unauthed pages are visible, but rendered with a LOCK button
    // so they're not actually "pruned" from the sidebar
    // TODO: move this out of a feature flag and into the navigation node metadata
    discoverable: (await loader.getEdgeFlags()).isAuthenticatedPagesDiscoverable
      ? (true as const)
      : undefined,
  });
}
