import { FernNavigation } from "../generated";
import { NavigationNode } from "./NavigationNode";
import { NavigationNodeApiLeaf, isApiLeaf } from "./NavigationNodeApiLeaf";
import { NavigationNodeWithMarkdown, hasMarkdown } from "./NavigationNodeMarkdown";

/**
 * A navigation node that represents a visitable page in the documentation
 */
export type NavigationNodePage =
    | NavigationNodeWithMarkdown
    | NavigationNodeApiLeaf
    | FernNavigation.ChangelogNode
    | FernNavigation.ChangelogYearNode
    | FernNavigation.ChangelogMonthNode;

export function isPage(node: NavigationNode): node is NavigationNodePage {
    return (
        isApiLeaf(node) ||
        node.type === "changelog" ||
        node.type === "changelogYear" ||
        node.type === "changelogMonth" ||
        hasMarkdown(node)
    );
}
