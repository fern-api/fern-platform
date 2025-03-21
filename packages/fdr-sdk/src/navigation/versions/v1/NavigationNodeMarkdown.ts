import type { NavigationNode } from "./NavigationNode";
import {
  type NavigationNodeMarkdownLeaf,
  isMarkdownLeaf,
} from "./NavigationNodePageLeaf";
import {
  type NavigationNodeSectionOverview,
  isSectionOverview,
} from "./NavigationNodeSectionOverview";

/**
 * A navigation node that contains markdown content
 */
export type NavigationNodeWithMarkdown =
  | NavigationNodeSectionOverview
  | NavigationNodeMarkdownLeaf;

export function hasMarkdown(
  node: NavigationNode
): node is NavigationNodeWithMarkdown {
  return isMarkdownLeaf(node) || isSectionOverview(node);
}
