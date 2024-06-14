import { FernNavigation } from "../generated";
import { NavigationNode } from "./NavigationNode";

/**
 * A leaf node that contains primarily markdown content
 */
export type NavigationNodeMarkdownLeaf = FernNavigation.ChangelogEntryNode | FernNavigation.PageNode;

export function isMarkdownLeaf(node: NavigationNode): node is NavigationNodeMarkdownLeaf {
    return node.type === "page" || node.type === "changelogEntry";
}
