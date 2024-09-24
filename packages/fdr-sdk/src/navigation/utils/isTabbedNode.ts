import { FernNavigation } from "../..";
import { NavigationNode } from "../types";

export function isTabbedNode(node: NavigationNode): node is FernNavigation.TabbedNode {
    return node.type === "tabbed";
}
