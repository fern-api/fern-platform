import { FernNavigation } from "../generated";
import { NavigationNode } from "./NavigationNode";

/**
 * Navigation nodes that extend WithRedirect
 */
export type NavigationNodeWithRedirect = Extract<NavigationNode, FernNavigation.WithRedirect>;

export function hasRedirect(node: NavigationNode): node is NavigationNodeWithRedirect {
    return typeof (node as NavigationNodeWithRedirect).pointsTo === "string";
}
