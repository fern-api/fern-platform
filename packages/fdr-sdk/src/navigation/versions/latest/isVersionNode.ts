import { NavigationNode, VersionNode } from ".";

export function isVersionNode(node: NavigationNode): node is VersionNode {
  return node.type === "version";
}
