import type { FernNavigation } from "../generated";
import type { NavigationNode } from "./NavigationNode";

/**
 * A navigation node that has a title and a slug
 */
export type NavigationNodeWithMetadata = Extract<NavigationNode, FernNavigation.WithNodeMetadata>;

export function hasMetadata(node: NavigationNode): node is NavigationNodeWithMetadata {
    return (
        typeof (node as NavigationNodeWithMetadata).title === "string" &&
        typeof (node as NavigationNodeWithMetadata).slug === "string"
    );
}
