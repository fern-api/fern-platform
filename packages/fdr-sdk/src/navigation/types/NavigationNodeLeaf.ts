import { NavigationNode } from "./NavigationNode";
import { NavigationNodeApiLeaf, isApiLeaf } from "./NavigationNodeApiLeaf";
import { NavigationNodeMarkdownLeaf, isMarkdownLeaf } from "./NavigationNodePageLeaf";

/**
 * A navigation node that represents a leaf in the navigation tree (i.e. a node that does not have children)
 */
export type NavigationNodeLeaf = NavigationNodeApiLeaf | NavigationNodeMarkdownLeaf;

export function isLeaf(node: NavigationNode): node is NavigationNodeLeaf {
    return isApiLeaf(node) || isMarkdownLeaf(node);
}
