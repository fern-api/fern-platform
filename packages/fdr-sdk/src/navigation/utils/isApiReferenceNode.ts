import { FernNavigation } from "../generated";
import { NavigationNode } from "../types";

export function isApiReferenceNode(node: NavigationNode): node is FernNavigation.ApiReferenceNode {
    return node.type === "apiReference";
}
