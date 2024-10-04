import { RootNode, isPage, utils } from "@fern-api/fdr-sdk/navigation";
import { matchPath } from "@fern-ui/fern-docs-utils";
import { captureMessage } from "@sentry/nextjs";

/**
 * @param config Basic token verification configuration
 * @param pathname pathname of the request to check
 * @returns true if the request is allowed to pass through, false otherwise
 */
export function withBasicTokenViewAllowed(allowlist: string[] = [], pathname: string): boolean {
    // if the path is in the allowlist, allow the request to pass through
    if (allowlist.find((path) => matchPath(path, pathname))) {
        return true;
    }
    return false;
}

export function pruneWithBasicTokenViewAllowed(node: RootNode, allowlist: string[] | undefined): RootNode {
    const result = utils.pruneNavigationTree(node, (node) => {
        if (isPage(node)) {
            return withBasicTokenViewAllowed(allowlist, `/${node.slug}`);
        }

        return true;
    });

    // TODO: handle this more gracefully
    if (result == null) {
        captureMessage("Failed to prune navigation tree", "fatal");
        throw new Error("Failed to prune navigation tree");
    }

    return result;
}
