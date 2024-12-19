import { FernNavigation } from "../../..";

export function isUnversionedNode(
    node: FernNavigation.NavigationNode
): node is FernNavigation.UnversionedNode {
    return node.type === "unversioned";
}
