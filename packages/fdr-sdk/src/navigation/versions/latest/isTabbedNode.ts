import { FernNavigation } from "../../..";

export function isTabbedNode(
    node: FernNavigation.NavigationNode
): node is FernNavigation.TabbedNode {
    return node.type === "tabbed";
}
