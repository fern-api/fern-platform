import { MarkOptional, UnreachableCaseError } from "ts-essentials";

import { FernNavigation } from "../..";
import { DeleterAction } from "../../utils/traversers/types";

/**
 * @param parent delete node from this parent (mutable)
 * @param node node to delete
 * @param force if true, delete the node even if it is not a leaf node
 * @returns the id of the deleted node or null if the node was not deletable from the parent
 */
export function mutableDeleteChild(
  parent: FernNavigation.NavigationNodeParent | undefined,
  node: FernNavigation.NavigationNode,
  force = false
): DeleterAction {
  /**
   * The idea here is we should only delete leaf nodes (we're treating changelogs here like a leaf node)
   *
   * In the case that we have sections that have content, deleting it from its parent would delete all its children as well.
   * Instead, we'll just remove the overviewPageId, which will make the section a non-visitable node, yet still retain its children.
   */
  if (
    !force &&
    !FernNavigation.isLeaf(node) &&
    FernNavigation.isPage(node) &&
    FernNavigation.getChildren(node).length > 0 &&
    node.type !== "changelog"
  ) {
    // if the node to be deleted is a section, remove the overviewPageId
    if (FernNavigation.isSectionOverview(node)) {
      (node as MarkOptional<typeof node, "overviewPageId">).overviewPageId =
        undefined;

      if (node.children.length === 0) {
        return "deleted";
      }

      return "noop";
    } else {
      throw new UnreachableCaseError(node);
    }
  }

  // if the node is not a leaf node, don't delete it from the parent unless it has no children
  if (
    !force &&
    !FernNavigation.isLeaf(node) &&
    FernNavigation.getChildren(node).length > 0
  ) {
    return "noop";
  }

  if (parent == null) {
    return "deleted";
  }

  switch (parent.type) {
    case "apiPackage":
      parent.children = parent.children.filter((child) => child.id !== node.id);
      break;
    case "apiReference":
      parent.children = parent.children.filter((child) => child.id !== node.id);
      parent.changelog =
        parent.changelog?.id === node.id ? undefined : parent.changelog;
      break;
    case "changelog":
      parent.children = parent.children.filter((child) => child.id !== node.id);
      break;
    case "changelogYear":
      parent.children = parent.children.filter((child) => child.id !== node.id);
      break;
    case "changelogMonth":
      parent.children = parent.children.filter((child) => child.id !== node.id);
      break;
    case "endpointPair":
      return "should-delete-parent";
    case "productgroup":
      parent.children = parent.children.filter((child) => child.id !== node.id);
      parent.landingPage =
        parent.landingPage?.id === node.id ? undefined : parent.landingPage;
      break;
    case "product":
    case "root":
      return "should-delete-parent";
    case "unversioned":
      if (node.id === parent.landingPage?.id) {
        parent.landingPage = undefined;
      }
      break;
    case "section":
      parent.children = parent.children.filter((child) => child.id !== node.id);
      break;
    case "sidebarGroup":
      parent.children = parent.children.filter((child) => child.id !== node.id);
      break;
    case "tab":
      return "should-delete-parent";
    case "sidebarRoot":
      parent.children = parent.children.filter((child) => child.id !== node.id);
      break;
    case "tabbed":
      parent.children = parent.children.filter((child) => child.id !== node.id);
      break;
    case "version":
      if (node.id === parent.landingPage?.id) {
        parent.landingPage = undefined;
      }
      break;
    case "versioned":
      parent.children = parent.children.filter((child) => child.id !== node.id);
      break;
    default:
      throw new UnreachableCaseError(parent);
  }

  if (FernNavigation.isPage(parent)) {
    return "noop";
  } else if (FernNavigation.getChildren(parent).length > 0) {
    return "deleted";
  } else {
    return "should-delete-parent";
  }
}
