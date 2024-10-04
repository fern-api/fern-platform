import { UnreachableCaseError } from "ts-essentials";
import { FernNavigation } from "../..";
import { hasChildren } from "./hasChildren";
import { updatePointsTo } from "./updatePointsTo";

/**
 *
 * @param root the root node of the navigation tree
 * @param keep a function that returns true if the node should be kept
 * @returns
 */
export function pruneNavigationTree<ROOT extends FernNavigation.NavigationNode>(
    root: ROOT,
    keep: (node: FernNavigation.NavigationNode) => boolean,
): ROOT | undefined {
    const clone = structuredClone(root);

    // keeps track of deleted nodes to avoid deleting them multiple times
    const deleted = new Set<FernNavigation.NodeId>();

    FernNavigation.traverseNavigationLevelOrder(clone, (node, parents) => {
        // if the node was already deleted, we don't need to traverse it
        if (deleted.has(node.id)) {
            return "skip";
        }

        // continue traversal if the node is not to be deleted
        if (keep(node)) {
            return;
        }

        deleteChild(node, parents, deleted).forEach((id) => {
            deleted.add(id);
        });

        // since the node was deleted, its children are deleted too
        // we don't need to traverse them, nor do we need to keep them in the tree.
        return "skip";
    });

    if (deleted.has(clone.id)) {
        return undefined;
    }

    if (deleted.size > 0) {
        // since the tree has been pruned, we need to update the pointsTo property
        updatePointsTo(clone);
    }

    return clone;
}

/**
 * Deletes a child from a parent node
 *
 * If the parent node cannot be deleted, it will deleted too via recursion.
 *
 * @param node the child node to delete
 * @param parent the parent node
 * @param deleted a set of nodes that have already been deleted
 * @returns a list of deleted nodes
 */
function deleteChild(
    node: FernNavigation.NavigationNode,
    parents: readonly FernNavigation.NavigationNodeWithChildren[],
    deleted: Set<FernNavigation.NodeId> = new Set(),
): FernNavigation.NodeId[] {
    const ancestors = [...parents];
    const parent = ancestors.pop(); // the parent node is the last element in the array
    if (parent == null) {
        return [];
    } else if (deleted.has(parent.id)) {
        return [node.id];
    }

    const internalDeleted = (() => {
        switch (parent.type) {
            case "apiPackage":
                parent.children = parent.children.filter((child) => child.id !== node.id);
                return [node.id];
            case "apiReference":
                parent.children = parent.children.filter((child) => child.id !== node.id);
                parent.changelog = parent.changelog?.id === node.id ? undefined : parent.changelog;
                return [node.id];
            case "changelog":
                parent.children = parent.children.filter((child) => child.id !== node.id);
                return [node.id];
            case "changelogYear":
                parent.children = parent.children.filter((child) => child.id !== node.id);
                return [node.id];
            case "changelogMonth":
                parent.children = parent.children.filter((child) => child.id !== node.id);
                return [node.id];
            case "endpointPair":
                return [...deleteChild(parent, ancestors), node.id];
            case "productgroup":
                parent.children = parent.children.filter((child) => child.id !== node.id);
                parent.landingPage = parent.landingPage?.id === node.id ? undefined : parent.landingPage;
                return [node.id];
            case "product":
                return [...deleteChild(parent, ancestors), node.id];
            case "root":
                return [...deleteChild(parent, ancestors), node.id];
            case "unversioned":
                if (node.id === parent.landingPage?.id) {
                    parent.landingPage = undefined;
                    return [node.id];
                }
                return [...deleteChild(parent, ancestors), node.id];
            case "section":
                parent.children = parent.children.filter((child) => child.id !== node.id);
                return [node.id];
            case "sidebarGroup":
                parent.children = parent.children.filter((child) => child.id !== node.id);
                return [node.id];
            case "tab":
                return [...deleteChild(parent, ancestors), node.id];
            case "sidebarRoot":
                parent.children = parent.children.filter((child) => child.id !== node.id);
                return [node.id];
            case "tabbed":
                parent.children = parent.children.filter((child) => child.id !== node.id);
                return [node.id];
            case "version":
                if (node.id === parent.landingPage?.id) {
                    parent.landingPage = undefined;
                    return [node.id];
                }
                return [...deleteChild(parent, ancestors), node.id];
            case "versioned":
                parent.children = parent.children.filter((child) => child.id !== node.id);
                return [node.id];
            default:
                throw new UnreachableCaseError(parent);
        }
    })();

    // after deletion, if the node has no children, we can delete the parent node too
    if (!hasChildren(parent) && !internalDeleted.includes(parent.id)) {
        return [...deleteChild(parent, ancestors), ...internalDeleted];
    }

    return internalDeleted;
}
