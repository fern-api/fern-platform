import { FernNavigation } from "../..";
import { followRedirect } from "./followRedirect";

/**
 * Uses depth-first traversal to update the pointsTo property of all nodes in the tree.
 *
 * @param input will be mutated
 */
export function mutableUpdatePointsTo(
  input: FernNavigation.NavigationNode
): void {
  FernNavigation.traverseDF(input, (node) => {
    if (FernNavigation.hasPointsTo(node)) {
      const pointsTo = followRedirect(node);
      node.pointsTo = node.slug === pointsTo ? undefined : pointsTo;
    }
  });
}
