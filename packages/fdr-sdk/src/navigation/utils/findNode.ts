import escapeStringRegexp from "escape-string-regexp";

import { FernNavigation } from "../..";
import { NodeCollector } from "../NodeCollector";
import { isApiReferenceNode } from "../versions/latest/isApiReferenceNode";
import { isSidebarRootNode } from "../versions/latest/isSidebarRootNode";
import { isTabbedNode } from "../versions/latest/isTabbedNode";
import { isUnversionedNode } from "../versions/latest/isUnversionedNode";
import { isVersionNode } from "../versions/latest/isVersionNode";
import { createBreadcrumb } from "./createBreadcrumb";

export type Node = Node.Found | Node.Redirect | Node.NotFound;

export declare namespace Node {
  interface Found {
    type: "found";
    node: FernNavigation.NavigationNodePage;
    parents: readonly FernNavigation.NavigationNodeParent[];
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    root: FernNavigation.RootNode;
    versions: readonly FernNavigation.VersionNode[];
    currentVersion: FernNavigation.VersionNode | undefined;
    /**
     * This is true if the current version is the default version node (without the version slug prefix)
     */
    isCurrentVersionDefault: boolean;
    currentTab:
      | FernNavigation.TabNode
      | FernNavigation.ChangelogNode
      | undefined;
    tabs: readonly FernNavigation.TabChild[];
    sidebar: FernNavigation.SidebarRootNode | undefined;
    apiReference: FernNavigation.ApiReferenceNode | undefined;
    next: FernNavigation.NavigationNodeNeighbor | undefined;
    prev: FernNavigation.NavigationNodeNeighbor | undefined;
    collector: NodeCollector;
    landingPage: FernNavigation.LandingPageNode | undefined;

    /**
     * This is the part of the slug after the version (or basepath) prefix.
     *
     * For example, if the original slug is "docs/v1.0.0/foo/bar", the unversionedSlug is "foo/bar".
     */
    unversionedSlug: FernNavigation.Slug;
  }

  interface Redirect {
    type: "redirect";
    redirect: FernNavigation.Slug;
  }

  interface NotFound {
    type: "notFound";
    redirect: FernNavigation.Slug | undefined;
    authed: boolean | undefined;
  }
}

export function findNode(
  root: FernNavigation.RootNode,
  slug: FernNavigation.Slug
): Node {
  const collector = NodeCollector.collect(root);
  const found = collector.getSlugMapWithParents().get(slug);

  // if the slug points to a node that doesn't exist, we should redirect to the first likely node
  if (found == null) {
    let maybeVersionNode: FernNavigation.RootNode | FernNavigation.VersionNode =
      root;

    // the 404 behavior should be version-aware
    for (const versionNode of collector.getVersionNodes()) {
      if (slug.startsWith(versionNode.slug)) {
        maybeVersionNode = versionNode;
        break;
      }
    }

    return {
      type: "notFound",
      redirect: maybeVersionNode.pointsTo,
      authed: maybeVersionNode.authed,
    };
  }

  const sidebar = found.parents.find(isSidebarRootNode);
  const currentVersion = found.parents.find(isVersionNode);
  const unversionedNode = found.parents.find(isUnversionedNode);
  const versionChild = (currentVersion ?? unversionedNode)?.child;
  const landingPage = (currentVersion ?? unversionedNode)?.landingPage;

  const tabbedNode =
    found.parents.find(isTabbedNode) ??
    // fallback to the version child because the current node may be a landing page
    (versionChild != null && isTabbedNode(versionChild)
      ? versionChild
      : undefined);

  const apiReference =
    found.parents.find(isApiReferenceNode) ??
    (found.node.type === "apiReference" ? found.node : undefined);

  // if the node is visible (becaues it's a page), return it as "found"
  if (FernNavigation.isPage(found.node)) {
    const parentsAndNode = [...found.parents, found.node];
    const tabbedNodeIndex = parentsAndNode.findIndex(
      (node) => node === tabbedNode
    );
    const currentTabNode =
      tabbedNodeIndex !== -1 ? parentsAndNode[tabbedNodeIndex + 1] : undefined;
    const versions = collector.getVersionNodes().map((node) => {
      if (node.default) {
        // if we're currently viewing the default version, we may be viewing the non-pruned version
        if (node.id === currentVersion?.id) {
          return currentVersion;
        }
        // otherwise, we should always use the pruned version node
        return collector.defaultVersionNode ?? node;
      }
      return node;
    });
    const currentTab =
      currentTabNode?.type === "tab" || currentTabNode?.type === "changelog"
        ? currentTabNode
        : undefined;
    const slugPrefix = currentVersion?.slug ?? root.slug;
    const unversionedSlug = FernNavigation.Slug(
      found.node.slug.replace(
        new RegExp(`^${escapeStringRegexp(slugPrefix)}/`),
        ""
      )
    );
    return {
      type: "found",
      node: found.node,
      breadcrumb: createBreadcrumb(found.parents),
      parents: found.parents,
      root,
      versions, // this is used to render the version switcher
      tabs: tabbedNode?.children ?? [],
      currentVersion,
      isCurrentVersionDefault: currentVersion?.default
        ? currentVersion === collector.defaultVersionNode
        : false,
      currentTab,
      sidebar,
      apiReference,
      landingPage,
      next: found.next,
      prev: found.prev,
      collector,
      unversionedSlug,
    };
  }

  // if the slug points matches the root node, redirect to the root node's pointsTo
  if (root.type === "root" && root.slug === slug && root.pointsTo != null) {
    return { type: "redirect", redirect: root.pointsTo };
  }

  // if the node has a redirect, return it
  if (FernNavigation.hasRedirect(found.node) && found.node.pointsTo != null) {
    return { type: "redirect", redirect: found.node.pointsTo };
  }

  // if the node does not have a redirect, return a 404
  return {
    type: "notFound",
    redirect: currentVersion?.pointsTo ?? root.pointsTo,
    authed: found.node.authed,
  };
}
