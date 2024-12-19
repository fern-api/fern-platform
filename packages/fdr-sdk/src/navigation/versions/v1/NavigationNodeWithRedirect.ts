import type { WithRedirect } from ".";
import type { NavigationNode } from "./NavigationNode";

/**
 * Navigation nodes that extend WithRedirect
 */
export type NavigationNodeWithRedirect = Extract<NavigationNode, WithRedirect>;

export function hasRedirect(
    node: NavigationNode
): node is NavigationNodeWithRedirect {
    return typeof (node as NavigationNodeWithRedirect).pointsTo === "string";
}
