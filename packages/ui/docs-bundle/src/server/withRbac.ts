import { FernNavigation } from "@fern-api/fdr-sdk";
import {
    NavigationNodeParent,
    Pruner,
    hasMetadata,
    isPage,
    type NavigationNode,
    type RootNode,
} from "@fern-api/fdr-sdk/navigation";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import type { AuthEdgeConfigBasicTokenVerification } from "@fern-ui/fern-docs-auth";
import { EVERYONE_ROLE, matchPath } from "@fern-ui/fern-docs-utils";

interface AuthRulesPathName {
    /**
     * List of paths that should be allowed to pass through without authentication
     */
    allowlist?: string[];

    /**
     * List of paths that should be denied access without authentication
     */
    denylist?: string[];

    /**
     * List of paths that should be allowed to pass through without authentication, but should be hidden when the user is authenticated
     */
    anonymous?: string[];
}

/**
 * @returns true if the request should should be marked as authed
 */
export function withBasicTokenAnonymous(auth: AuthRulesPathName, pathname: string): boolean {
    // if the path is in the denylist, deny the request
    if (auth.denylist?.find((path) => matchPath(path, pathname))) {
        return true;
    }

    // if the path is in the allowlist, allow the request to pass through
    if (
        auth.allowlist?.find((path) => matchPath(path, pathname)) ||
        auth.anonymous?.find((path) => matchPath(path, pathname))
    ) {
        return false;
    }

    // if the path is not in the allowlist, deny the request
    return true;
}

/**
 * @internal visibleForTesting
 */
export function withBasicTokenAnonymousCheck(
    auth: AuthRulesPathName,
): (node: NavigationNode, parents?: readonly NavigationNodeParent[]) => boolean {
    return (node, parents = EMPTY_ARRAY) => {
        if (!rbacViewPredicate([], false)(node, parents)) {
            return false;
        }

        if (isPage(node)) {
            return withBasicTokenAnonymous(auth, `/${node.slug}`);
        }

        return false;
    };
}

export function pruneWithBasicTokenAnonymous(auth: AuthEdgeConfigBasicTokenVerification, node: RootNode): RootNode {
    const result = Pruner.from(node)
        // mark nodes that are authed
        .authed(withBasicTokenAnonymousCheck(auth))
        .get();

    // TODO: handle this more gracefully
    if (result == null) {
        throw new Error("Failed to prune navigation tree");
    }

    return result;
}

function getAudienceFilters(...node: FernNavigation.NavigationNode[]): string[][] {
    return node.map((n) => (hasMetadata(n) ? (n.audience ?? []) : [])).filter((audience) => audience.length > 0);
}

/**
 * @internal
 * @param roles current viewer's roles
 * @param filters rbac filters for the current node
 * @returns true if the roles matches the filters (i.e. the viewer is allowed to view the node)
 */
export function matchRoles(roles: string[], filters: string[][]): boolean {
    if (filters.length === 0 || filters.every((filter) => filter.length === 0)) {
        return true;
    }

    return filters.every((filter) => filter.some((aud) => roles.includes(aud) || aud === EVERYONE_ROLE));
}

export function pruneWithBasicTokenAuthed(auth: AuthRulesPathName, node: RootNode, roles: string[] = []): RootNode {
    const result = Pruner.from(node)
        // apply rbac
        .keep(rbacViewPredicate(roles, true))
        // hide nodes that are not authed
        .hide((n) => node.hidden || auth.anonymous?.find((path) => matchPath(path, `/${n.slug}`)) != null)
        // mark all nodes as unauthed since we are currently authenticated
        .authed(() => false)
        .get();

    // TODO: handle this more gracefully
    if (result == null) {
        throw new Error("Failed to prune navigation tree");
    }

    return result;
}

/**
 * @param nodes - navigation nodes to get the viewer filters for
 * @returns the viewer filters for the given nodes
 * @internal visibleForTesting
 */
export function getViewerFilters(...nodes: FernNavigation.WithPermissions[]): string[][] {
    // ignore permissions of parents of the parents of an orphaned node
    const lastOrphanedIdx = nodes.findLastIndex((n) => n.orphaned);
    return (
        nodes
            .slice(Math.max(lastOrphanedIdx, 0))
            // TODO: if we ever support editors, we need to update this
            .map((n) => n.viewers ?? [])
            .filter((roles) => roles.length > 0)
    );
}

function rbacViewPredicate(
    roles: string[],
    authed: boolean,
): (node: NavigationNode, parents: readonly NavigationNodeParent[]) => boolean {
    return (node, parents) => {
        if (!hasMetadata(node)) {
            return true;
        }

        if (!authed && node.authed) {
            return false;
        }

        const nodes = [...parents, node];
        return matchRoles(roles, getViewerFilters(...nodes.filter(FernNavigation.hasMetadata)));
    };
}
