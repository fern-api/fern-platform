import { dfs } from "../../../utils/traversers/dfs";
import { TraverserVisit } from "../../../utils/traversers/types";
import { NavigationNode } from "./NavigationNode";
import { NavigationNodeParent } from "./NavigationNodeParent";
import { getChildren } from "./getChildren";

/**
 * Traverse the navigation tree in a depth-first manner (pre-order).
 */
export function traverseDF(node: NavigationNode, visit: TraverserVisit<NavigationNode, NavigationNodeParent>): void {
    return dfs(node, visit, getChildren);
}
