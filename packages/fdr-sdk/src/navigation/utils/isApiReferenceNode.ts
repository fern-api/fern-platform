import { FernNavigation } from "../..";
import { NavigationNode } from "../types";

export function isApiReferenceNode(node: NavigationNode): node is FernNavigation.ApiReferenceNode {
    return node.type === "apiReference";
}
