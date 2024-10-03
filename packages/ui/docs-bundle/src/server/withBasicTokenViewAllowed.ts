import { matchPath } from "@fern-ui/fern-docs-utils";

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
