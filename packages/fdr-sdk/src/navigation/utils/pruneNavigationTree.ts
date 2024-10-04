import structuredClone from "@ungap/structured-clone";
import { DeepReadonly } from "ts-essentials";
import { FernNavigation } from "../..";
import { prunetree } from "../../utils/traversers/prunetree";
import { mutableDeleteChild } from "./deleteChild";
import { hasChildren } from "./hasChildren";
import { mutableUpdatePointsTo } from "./updatePointsTo";

/**
 * @param root the root node of the navigation tree
 * @param keep a function that returns true if the node should be kept
 * @returns a new navigation tree with only the nodes that should be kept
 */
export function pruneNavigationTree<ROOT extends FernNavigation.NavigationNode>(
    root: DeepReadonly<ROOT>,
    keep: (node: FernNavigation.NavigationNode) => boolean,
): ROOT | undefined {
    const clone = structuredClone(root) as ROOT;
    return mutablePruneNavigationTree(clone, keep);
}

function mutablePruneNavigationTree<ROOT extends FernNavigation.NavigationNode>(
    root: ROOT,
    keep: (node: FernNavigation.NavigationNode) => boolean,
): ROOT | undefined {
    const [result] = prunetree(root, {
        predicate: keep,
        getChildren: FernNavigation.getChildren,
        getPointer: (node) => node.id,
        deleter: mutableDeleteChild,

        // after deletion, if the node no longer has any children, we can delete the parent node too
        // but only if the parent node is NOT a visitable page
        shouldDeleteParent: (parent: FernNavigation.NavigationNodeParent) =>
            !hasChildren(parent) && !FernNavigation.isPage(parent),
    });

    if (result == null) {
        return undefined;
    }

    // since the tree has been pruned, we need to update the pointsTo property
    mutableUpdatePointsTo(result);

    return result;
}
