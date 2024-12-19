import type {
    ApiPackageNode,
    ApiReferenceNode,
    ChangelogNode,
    SectionNode,
} from ".";
import type { NavigationNode } from "./NavigationNode";

/**
 * A navigation node that isn't a leaf node and contains markdown content
 */
export type NavigationNodeSection =
    | SectionNode
    | ApiReferenceNode
    | ChangelogNode
    | ApiPackageNode;

export function isSection(node: NavigationNode): node is NavigationNodeSection {
    return (
        node.type === "section" ||
        node.type === "apiReference" ||
        node.type === "changelog" ||
        node.type === "apiPackage"
    );
}
