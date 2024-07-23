import { FernNavigation } from "../generated";
import { NavigationNode } from "../types";

export function isTabbedNode(node: NavigationNode): node is FernNavigation.TabbedNode {
    return node.type === "tabbed";
}
