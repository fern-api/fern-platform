import { MarkOptional, UnreachableCaseError } from "ts-essentials";
import { FernNavigation } from "../..";
import { DeleterAction } from "../../utils/traversers/types";

/**
 * @param parent delete node from this parent (mutable)
 * @param node node to delete
 * @returns the id of the deleted node or null if the node was not deletable from the parent
 */
export function mutableDeleteChild(
    parent: FernNavigation.NavigationNodeParent | undefined,
    node: FernNavigation.NavigationNode,
): DeleterAction {
    /**
     * The idea here is we should only delete leaf nodes (we're treating changelogs here like a leaf node)
     *
     * In the case that we have sections that have content, deleting it from its parent would delete all its children as well.
     * Instead, we'll just remove the overviewPageId, which will make the section a non-visitable node, yet still retain its children.
     */
    if (
        !FernNavigation.isLeaf(node) &&
        FernNavigation.isPage(node) &&
        FernNavigation.getChildren(node).length > 0 &&
        node.type !== "changelog"
    ) {
        // if the node to be deleted is a section, remove the overviewPageId
        if (FernNavigation.isSectionOverview(node)) {
            (node as MarkOptional<typeof node, "overviewPageId">).overviewPageId = undefined;
            return "noop";
        } else {
            throw new UnreachableCaseError(node);
        }
    }

    // if the node is not a leaf node, don't delete it from the parent unless it has no children
    if (!FernNavigation.isLeaf(node) && FernNavigation.getChildren(node).length > 0) {
        return "noop";
    }

    if (parent == null) {
        return "deleted";
    }

    switch (parent.type) {
        case "apiPackage":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return "deleted";
        case "apiReference":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            parent.changelog = parent.changelog?.id === node.id ? undefined : parent.changelog;
            return "deleted";
        case "changelog":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return "deleted";
        case "changelogYear":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return "deleted";
        case "changelogMonth":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return "deleted";
        case "endpointPair":
            return "should-delete-parent";
        case "productgroup":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            parent.landingPage = parent.landingPage?.id === node.id ? undefined : parent.landingPage;
            return "deleted";
        case "product":
            return "should-delete-parent";
        case "root":
            return "should-delete-parent";
        case "unversioned":
            if (node.id === parent.landingPage?.id) {
                parent.landingPage = undefined;
                return "deleted";
            }
            return "should-delete-parent";
        case "section":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return "deleted";
        case "sidebarGroup":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return "deleted";
        case "tab":
            return "should-delete-parent";
        case "sidebarRoot":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return "deleted";
        case "tabbed":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return "deleted";
        case "version":
            if (node.id === parent.landingPage?.id) {
                parent.landingPage = undefined;
                return "deleted";
            }
            return "should-delete-parent";
        case "versioned":
            parent.children = parent.children.filter((child) => child.id !== node.id);
            return "deleted";
        default:
            throw new UnreachableCaseError(parent);
    }
}
