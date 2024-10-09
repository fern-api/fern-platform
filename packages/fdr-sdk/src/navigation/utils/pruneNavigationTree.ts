import structuredClone from "@ungap/structured-clone";
import { DeepReadonly } from "ts-essentials";
import { FernNavigation } from "../..";
import { bfs } from "../../utils/traversers/bfs";
import { prunetree } from "../../utils/traversers/prunetree";
import { mutableDeleteChild } from "./deleteChild";
import { mutableUpdatePointsTo } from "./updatePointsTo";

/**
 * @param root the root node of the navigation tree
 * @param keep a function that returns true if the node should be kept
 * @param hide a function that returns true if the node should be hidden
 * @returns a new navigation tree with only the nodes that should be kept
 */
export function pruneNavigationTree<ROOT extends FernNavigation.NavigationNode>(
    root: DeepReadonly<ROOT>,
    keep?: (node: FernNavigation.NavigationNode) => boolean,
    hide?: (node: FernNavigation.NavigationNodeWithMetadata) => boolean,
): ROOT | undefined {
    const clone = structuredClone(root) as ROOT;
    return mutablePruneNavigationTree(clone, keep, hide);
}

function mutablePruneNavigationTree<ROOT extends FernNavigation.NavigationNode>(
    root: ROOT,
    keep: (node: FernNavigation.NavigationNode) => boolean = () => true,
    hide: (node: FernNavigation.NavigationNodeWithMetadata) => boolean = () => false,
): ROOT | undefined {
    const [result] = prunetree(root, {
        predicate: keep,
        getChildren: FernNavigation.getChildren,
        getPointer: (node) => node.id,
        deleter: mutableDeleteChild,
    });

    if (result == null) {
        return undefined;
    }

    // since the tree has been pruned, we need to update the pointsTo property
    mutableUpdatePointsTo(result);

    // other operations
    bfs(
        result,
        (node) => {
            if (FernNavigation.hasMarkdown(node) && hide(node)) {
                node.hidden = true;
            }
        },
        FernNavigation.getChildren,
    );

    return result;
}
