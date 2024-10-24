import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

interface WithPrunedSidebarOpts {
    node: FernNavigation.NavigationNode;
    isAuthenticated: boolean;
    isAuthenticatedPagesDiscoverable: boolean;
}

/**
 * Note: at the stage of calling this function, the RBAC should already been evaluated on the node.
 */
export function pruneNavigationPredicate(
    n: FernNavigation.NavigationNode,
    { node, isAuthenticated, isAuthenticatedPagesDiscoverable }: WithPrunedSidebarOpts,
): boolean {
    // prune hidden nodes, unless it is the current node
    if (FernNavigation.hasMetadata(n) && n.hidden) {
        return n.id === node.id;
    }

    // prune authenticated pages (unless the isAuthenticatedPagesDiscoverable flag is turned on)
    if (FernNavigation.hasMetadata(n) && n.authed && isAuthenticated && !isAuthenticatedPagesDiscoverable) {
        return false;
    }

    // prune nodes that are not pages and have no children (avoid pruning links)
    if (!FernNavigation.isPage(n) && !FernNavigation.isLeaf(n)) {
        return FernNavigation.getChildren(n).length > 0;
    }

    return true;
}

export function withPrunedSidebar(
    sidebar: FernNavigation.SidebarRootNode | undefined,
    opts: WithPrunedSidebarOpts,
): FernNavigation.SidebarRootNode | undefined {
    if (!sidebar) {
        return sidebar;
    }

    return FernNavigation.Pruner.from(sidebar)
        .keep((n) => pruneNavigationPredicate(n, opts))
        .get();
}
