import { FernNavigation } from "../..";
import { NavigationNode } from "../types";

export function isUnversionedNode(node: NavigationNode): node is FernNavigation.UnversionedNode {
    return node.type === "unversioned";
}
