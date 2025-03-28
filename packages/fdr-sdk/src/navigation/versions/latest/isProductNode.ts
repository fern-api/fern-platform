import { NavigationNode, ProductNode } from ".";

export function isProductNode(node: NavigationNode): node is ProductNode {
  return node.type === "product";
}
