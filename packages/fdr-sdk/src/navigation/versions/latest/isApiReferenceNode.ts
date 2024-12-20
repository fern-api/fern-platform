import { FernNavigation } from "../../..";

export function isApiReferenceNode(
  node: FernNavigation.NavigationNode
): node is FernNavigation.ApiReferenceNode {
  return node.type === "apiReference";
}
