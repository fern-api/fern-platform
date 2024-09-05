import type { FernNavigation } from "../generated";
import type { NavigationNode } from "./NavigationNode";
import { isApiLeaf, type NavigationNodeApiLeaf } from "./NavigationNodeApiLeaf";
import { isSectionOverview, type NavigationNodeSectionOverview } from "./NavigationNodeSectionOverview";

export type NavigationNodeNeighbor =
    | NavigationNodeApiLeaf
    | FernNavigation.PageNode
    | FernNavigation.ChangelogNode
    | FernNavigation.ChangelogEntryNode
    | NavigationNodeSectionOverview;

export function isNeighbor(node: NavigationNode): node is NavigationNodeNeighbor {
    return (
        isApiLeaf(node) ||
        node.type === "page" ||
        node.type === "changelog" ||
        node.type === "changelogEntry" ||
        isSectionOverview(node)
    );
}
