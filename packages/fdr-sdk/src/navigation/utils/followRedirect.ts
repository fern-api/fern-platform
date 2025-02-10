import { UnreachableCaseError } from "ts-essentials";

import { FernNavigation } from "../..";

export function followRedirect(
  nodeToFollow: FernNavigation.NavigationNode | undefined
): FernNavigation.Slug | undefined {
  if (nodeToFollow == null) {
    return undefined;
  }

  // skip authed pages (but do not skip authed edge nodes, since we want to follow redirects to unauthed children)
  // TODO: the `authed: boolean` logic here is a bit convoluted and will cause confusion. We should revisit this.
  if (FernNavigation.isPage(nodeToFollow) && !nodeToFollow.authed) {
    return nodeToFollow.slug;
  }

  // skip other leaf nodes that were not returned above
  if (FernNavigation.isLeaf(nodeToFollow)) {
    return undefined;
  }

  switch (nodeToFollow.type) {
    /**
     * Versioned and ProductGroup nodes are special in that they have a default child.
     */
    case "productgroup":
    case "versioned":
      return followRedirects([...nodeToFollow.children].sort(defaultFirst));
    case "apiReference":
    case "apiPackage":
    case "changelogMonth": // note: changelog month nodes don't exist yet as pages
    case "changelogYear": // note: changelog month nodes don't exist yet as pages
    case "endpointPair":
    case "product":
    case "root":
    case "section":
    case "sidebarRoot":
    case "sidebarGroup":
    case "tab":
    case "tabbed":
    case "unversioned":
    case "version":
    case "changelog":
      return followRedirects(FernNavigation.getChildren(nodeToFollow));
    default:
      throw new UnreachableCaseError(nodeToFollow);
  }
}

export function followRedirects(
  nodes: readonly FernNavigation.NavigationNode[]
): FernNavigation.Slug | undefined {
  for (const node of nodes) {
    // skip hidden nodes
    if (FernNavigation.hasMetadata(node) && node.hidden) {
      continue;
    }

    const redirect = followRedirect(node);
    if (redirect != null) {
      return redirect;
    }
  }
  return;
}

function rank<T extends { default: boolean; hidden: boolean | undefined }>(
  node: T
): number {
  return node.default && !node.hidden ? 1 : node.hidden ? -1 : 0;
}

function defaultFirst<
  T extends { default: boolean; hidden: boolean | undefined },
>(a: T, b: T): number {
  return rank(b) - rank(a);
}
