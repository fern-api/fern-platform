import { FernNavigation } from "../../..";

export function isSidebarRootNode(
    node: FernNavigation.NavigationNode
): node is FernNavigation.SidebarRootNode {
    return node.type === "sidebarRoot";
}
