import type { Slug, WithRedirect } from ".";
import type { NavigationNode } from "./NavigationNode";

/**
 * Navigation nodes that can have a redirect
 */
export type NavigationNodeWithPointsTo = Extract<NavigationNode, WithRedirect>;

export function hasPointsTo(
    node: NavigationNode
): node is NavigationNodeWithPointsTo {
    return (
        node.type === "root" ||
        node.type === "product" ||
        node.type === "version" ||
        node.type === "tab" ||
        node.type === "section" ||
        node.type === "apiReference" ||
        node.type === "apiPackage"
    );
}

/**
 * Navigation nodes that extend WithRedirect
 */

export function hasRedirect(
    node: NavigationNode
): node is NavigationNodeWithPointsTo & { pointsTo: Slug } {
    if (!hasPointsTo(node)) {
        return false;
    }
    return node.pointsTo != null;
}
