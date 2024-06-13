import { FernNavigation } from "../generated";
import { NavigationNode } from "./NavigationNode";

/**
 * Navigation nodes that extend WithRedirect
 */
export type NavigationNodeWithMetadata = Extract<NavigationNode, FernNavigation.WithRedirect>;

export function hasRedirect(node: NavigationNode): node is NavigationNodeWithMetadata {
    return typeof (node as NavigationNodeWithMetadata).pointsTo === "string";
}
