import { UnreachableCaseError } from "ts-essentials";
import { FernNavigation } from "../..";

/**
 * @param parent delete node from this parent (mutable)
 * @param node node to delete
 * @returns the id of the deleted node or null if the node was not deletable from the parent
 */
export function mutableDeleteChild(
    parent: FernNavigation.NavigationNodeParent,
    node: FernNavigation.NavigationNode,
): FernNavigation.NodeId | null {
    switch (parent.type) {
        case "apiPackage":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return node.id;
        case "apiReference":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            parent.changelog = parent.changelog?.id === node.id ? undefined : parent.changelog;
            return node.id;
        case "changelog":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return node.id;
        case "changelogYear":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return node.id;
        case "changelogMonth":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return node.id;
        case "endpointPair":
            return null;
        case "productgroup":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            parent.landingPage = parent.landingPage?.id === node.id ? undefined : parent.landingPage;
            return node.id;
        case "product":
            return null;
        case "root":
            return null;
        case "unversioned":
            if (node.id === parent.landingPage?.id) {
                parent.landingPage = undefined;
                return node.id;
            }
            return null;
        case "section":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return node.id;
        case "sidebarGroup":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return node.id;
        case "tab":
            return null;
        case "sidebarRoot":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return node.id;
        case "tabbed":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return node.id;
        case "version":
            if (node.id === parent.landingPage?.id) {
                parent.landingPage = undefined;
                return node.id;
            }
            return null;
        case "versioned":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return node.id;
        default:
            throw new UnreachableCaseError(parent);
    }
}
