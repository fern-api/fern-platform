import { getChildren, isLeaf, isPage, utils, type NavigationNode, type RootNode } from "@fern-api/fdr-sdk/navigation";
import { matchPath } from "@fern-ui/fern-docs-utils";
import type { AuthEdgeConfigBasicTokenVerification } from "@fern-ui/ui/auth";

/**
 * @param auth Basic token verification configuration
 * @param pathname pathname of the request to check
 * @returns true if the request is allowed to pass through, false otherwise
 */
export function withBasicTokenPublic(
    auth: Pick<AuthEdgeConfigBasicTokenVerification, "allowlist" | "denylist">,
    pathname: string,
): boolean {
    // if the path is in the denylist, deny the request
    if (auth.denylist?.find((path) => matchPath(path, pathname))) {
        return false;
    }

    // if the path is in the allowlist, allow the request to pass through
    if (auth.allowlist?.find((path) => matchPath(path, pathname))) {
        return true;
    }

    // if the path is not in the allowlist, deny the request
    return false;
}

/**
 * @internal visibleForTesting
 */
export function withBasicTokenPublicCheck(
    auth: Pick<AuthEdgeConfigBasicTokenVerification, "allowlist" | "denylist">,
): (node: NavigationNode) => boolean {
    return (node: NavigationNode) => {
        if (isPage(node)) {
            return withBasicTokenPublic(auth, `/${node.slug}`);
        } else if (!isLeaf(node) && getChildren(node).length === 0) {
            return false;
        }

        return true;
    };
}

export function pruneWithBasicTokenPublic(auth: AuthEdgeConfigBasicTokenVerification, node: RootNode): RootNode {
    const result = utils.pruneNavigationTree(node, withBasicTokenPublicCheck(auth));

    // TODO: handle this more gracefully
    if (result == null) {
        throw new Error("Failed to prune navigation tree");
    }

    return result;
}
