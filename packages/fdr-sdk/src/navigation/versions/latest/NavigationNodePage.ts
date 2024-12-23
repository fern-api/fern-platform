import type { ChangelogNode } from ".";
import type { NavigationNode } from "./NavigationNode";
import { isApiLeaf, type NavigationNodeApiLeaf } from "./NavigationNodeApiLeaf";
import {
  hasMarkdown,
  type NavigationNodeWithMarkdown,
} from "./NavigationNodeMarkdown";

/**
 * A navigation node that represents a visitable page in the documentation
 */
export type NavigationNodePage =
  | NavigationNodeWithMarkdown
  | NavigationNodeApiLeaf
  | ChangelogNode;
// | ChangelogYearNode
// | ChangelogMonthNode;

export function isPage<N extends NavigationNode>(
  node: N
): node is N & NavigationNodePage {
  return (
    isApiLeaf(node) ||
    node.type === "changelog" ||
    // TODO: Uncomment when changelog years and months are visitable
    // node.type === "changelogYear" ||
    // node.type === "changelogMonth" ||
    hasMarkdown(node)
  );
}
