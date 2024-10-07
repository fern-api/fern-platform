import { bfs } from "../../../utils/traversers/bfs";
import { TraverserVisit } from "../../../utils/traversers/types";
import { NavigationNode } from "./NavigationNode";
import { NavigationNodeParent } from "./NavigationNodeParent";
import { getChildren } from "./getChildren";

const SKIP = "skip" as const;

/**
 * Traverse the navigation tree in a depth-first manner (pre-order).
 */
export function traverseBF(node: NavigationNode, visit: TraverserVisit<NavigationNode, NavigationNodeParent>) {
    return bfs(node, visit, getChildren);
}
