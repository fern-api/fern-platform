import type { ChangelogEntryNode, ChangelogNode, PageNode } from ".";
import type { NavigationNode } from "./NavigationNode";
import { type NavigationNodeApiLeaf, isApiLeaf } from "./NavigationNodeApiLeaf";
import {
  type NavigationNodeSectionOverview,
  isSectionOverview,
} from "./NavigationNodeSectionOverview";

export type NavigationNodeNeighbor =
  | NavigationNodeApiLeaf
  | PageNode
  | ChangelogNode
  | ChangelogEntryNode
  | NavigationNodeSectionOverview;

export function isNeighbor(
  node: NavigationNode
): node is NavigationNodeNeighbor {
  return (
    isApiLeaf(node) ||
    node.type === "page" ||
    node.type === "changelog" ||
    node.type === "changelogEntry" ||
    isSectionOverview(node)
  );
}
