import { NavigationNode, ProductGroupNode } from ".";

export function isProductGroupNode(node: NavigationNode): node is ProductGroupNode {
  return node.type === "productgroup";
}
