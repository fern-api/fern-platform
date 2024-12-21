import type { NavigationNode } from "./NavigationNode";
import {
  isMarkdownLeaf,
  type NavigationNodeMarkdownLeaf,
} from "./NavigationNodePageLeaf";
import {
  isSectionOverview,
  type NavigationNodeSectionOverview,
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
