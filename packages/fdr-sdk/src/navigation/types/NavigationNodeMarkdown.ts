import { NavigationNode } from "./NavigationNode";
import { NavigationNodeMarkdownLeaf, isMarkdownLeaf } from "./NavigationNodePageLeaf";
import { NavigationNodeSectionOverview, isSectionOverview } from "./NavigationNodeSectionOverview";

/**
 * A navigation node that contains markdown content
 */
export type NavigationNodeWithMarkdown = NavigationNodeSectionOverview | NavigationNodeMarkdownLeaf;

export function hasMarkdown(node: NavigationNode): node is NavigationNodeWithMarkdown {
    return isMarkdownLeaf(node) || isSectionOverview(node);
}
