import { FernNavigation } from "../generated";
import { NavigationNode } from "../types";

export function isSidebarRootNode(node: NavigationNode): node is FernNavigation.SidebarRootNode {
    return node.type === "sidebarRoot";
}
