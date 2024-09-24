import { FernNavigation } from "../..";
import { NavigationNode } from "../types";

export function isVersionNode(node: NavigationNode): node is FernNavigation.VersionNode {
    return node.type === "version";
}
