import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

interface WithPrunedSidebarOpts {
  /**
   * If provided, hidden nodes in this list will not be pruned
   */
  visibleNodeIds?: FernNavigation.NodeId[];

  /**
   * If provided, all hidden nodes will not be pruned
   */
  showHidden?: boolean;

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
 * Note: at the stage of calling this function, the RBAC should already been evaluated (and nodes are completely filtered out that are not visible to the current user).
 * @returns true if the node should be included, false otherwise
 */
export function pruneNavigationPredicate(
  node: FernNavigation.NavigationNode,
  { visibleNodeIds, showHidden, authed, discoverable }: WithPrunedSidebarOpts
): boolean {
  // prune authenticated pages (unless the discoverable flag is turned on)
  if (FernNavigation.isPage(node) && node.authed && !authed && !discoverable) {
    return false;
  }

  // then, prune hidden nodes, unless it is the current node
  if (FernNavigation.hasMetadata(node) && node.hidden) {
    return (showHidden || visibleNodeIds?.includes(node.id)) ?? false;
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
