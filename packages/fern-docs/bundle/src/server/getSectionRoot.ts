import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { CONTINUE, STOP } from "@fern-api/fdr-sdk/traversers";
import { removeLeadingSlash } from "@fern-docs/utils";

export function getSectionRoot(
  root: FernNavigation.RootNode | undefined,
  path: string
): FernNavigation.NavigationNodeWithMetadata | undefined {
  if (root == null) {
    return undefined;
  }

  if (path === "/" || root.slug === removeLeadingSlash(path)) {
    return root;
  }

  let foundNode: FernNavigation.NavigationNodeWithMetadata | undefined;

  // traverse the tree in a breadth-first manner because the node we're looking for is likely to be near the root
  FernNavigation.traverseBF(root, (node) => {
    if (FernNavigation.hasMetadata(node)) {
      if (node.slug === removeLeadingSlash(path)) {
        foundNode = node;
        return STOP;
      }
    }
    return CONTINUE;
  });

  return foundNode;
}
