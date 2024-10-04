import { LinkNode } from ".";
import type { NavigationNode } from "./NavigationNode";
import { isApiLeaf, type NavigationNodeApiLeaf } from "./NavigationNodeApiLeaf";
import { isMarkdownLeaf, type NavigationNodeMarkdownLeaf } from "./NavigationNodePageLeaf";

/**
 * A navigation node that represents a leaf in the navigation tree (i.e. a node that does not have children)
 */
export type NavigationNodeLeaf = NavigationNodeApiLeaf | NavigationNodeMarkdownLeaf | LinkNode;

export function isLeaf(node: NavigationNode): node is NavigationNodeLeaf {
    return isApiLeaf(node) || isMarkdownLeaf(node) || node.type === "link";
}
