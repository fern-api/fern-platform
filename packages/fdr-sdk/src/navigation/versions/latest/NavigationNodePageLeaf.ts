import type { ChangelogEntryNode, LandingPageNode, PageNode } from ".";
import type { NavigationNode } from "./NavigationNode";

/**
 * A leaf node that contains primarily markdown content
 */
export type NavigationNodeMarkdownLeaf =
    | ChangelogEntryNode
    | PageNode
    | LandingPageNode;

export function isMarkdownLeaf(
    node: NavigationNode
): node is NavigationNodeMarkdownLeaf {
    return (
        node.type === "page" ||
        node.type === "landingPage" ||
        node.type === "changelogEntry"
    );
}
