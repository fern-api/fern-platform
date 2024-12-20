import { UnreachableCaseError } from "ts-essentials";
import { NavigationNodeParent } from "../versions";

export function hasChildren(node: NavigationNodeParent): boolean {
  switch (node.type) {
    case "apiPackage":
      return node.children.length > 0;
    case "apiReference":
      return node.children.length > 0 || node.changelog != null;
    case "changelog":
      return node.children.length > 0;
    case "changelogMonth":
      return node.children.length > 0;
    case "changelogYear":
      return node.children.length > 0;
    case "endpointPair":
      return true;
    case "productgroup":
      return node.children.length > 0 || node.landingPage != null;
    case "product":
      return true;
    case "root":
      return true;
    case "unversioned":
      return true;
    case "section":
      return node.children.length > 0;
    case "sidebarGroup":
      return node.children.length > 0;
    case "tab":
      return true;
    case "sidebarRoot":
      return node.children.length > 0;
    case "tabbed":
      return node.children.length > 0;
    case "version":
      return true;
    case "versioned":
      return node.children.length > 0;
    default:
      throw new UnreachableCaseError(node);
  }
}
