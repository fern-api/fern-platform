import { NavigationNode, hasPointsTo, traverseNavigationLevelOrder } from "../versions/latest";
import { followRedirect } from "./followRedirect";

/**
 * @param input will be mutated
 */
export function updatePointsTo(input: NavigationNode): void {
    traverseNavigationLevelOrder(input, (node) => {
        if (hasPointsTo(node)) {
            node.pointsTo = followRedirect(node);
        }
    });
}
