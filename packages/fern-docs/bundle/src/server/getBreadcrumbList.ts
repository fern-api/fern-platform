import urljoin from "url-join";

import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";

function toUrl(domain: string, slug: FernNavigation.Slug): string {
  return urljoin(withDefaultProtocol(domain), slug);
}

export function getBreadcrumbList(
  domain: string,
  parents: readonly FernNavigation.NavigationNode[],
  node: FernNavigation.NavigationNodePage,
  title?: string
): FernDocs.JsonLdBreadcrumbList {
  title ??= node.title;

  const elements: FernDocs.JsonLdBreadcrumbListElement[] = [];
  const visitedSlugs = new Set<string>();

  parents.forEach((parent) => {
    if (FernNavigation.hasMetadata(parent)) {
      const slug = visitedSlugs.has(parent.slug)
        ? FernNavigation.hasRedirect(parent)
          ? parent.pointsTo != null && !visitedSlugs.has(parent.pointsTo)
            ? parent.pointsTo
            : undefined
          : undefined
        : parent.slug;
      if (slug != null && slug !== node.slug) {
        elements.push({
          "@type": "ListItem",
          position: elements.length + 1,
          name: parent.title,
          item: toUrl(domain, slug),
        });
        visitedSlugs.add(parent.slug);
      }
    }
  });

  // the current page is the last item in the breadcrumb
  elements.push(
    // JsonLd.listItem(elements.length + 1, title, toUrl(domain, node.slug))
    {
      "@type": "ListItem",
      position: elements.length + 1,
      name: title,
      item: toUrl(domain, node.slug),
    }
  );

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: elements,
  };
}
