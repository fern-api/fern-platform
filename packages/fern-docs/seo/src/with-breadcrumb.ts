import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { addLeadingSlash, conformTrailingSlash } from "@fern-docs/utils";
import { BreadcrumbList, WithContext } from "schema-dts";
import * as JsonLd from "./jsonld";

function toUrl(domain: string, slug: FernNavigation.Slug): string {
  return String(
    new URL(
      conformTrailingSlash(addLeadingSlash(slug)),
      withDefaultProtocol(domain)
    )
  );
}

export function getBreadcrumbList(
  domain: string,
  parents: readonly FernNavigation.WithNodeMetadata[],
  node: FernNavigation.NavigationNodePage,
  title?: string
): WithContext<BreadcrumbList> {
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
        elements.push(
          JsonLd.listItem(
            elements.length + 1,
            parent.title,
            toUrl(domain, slug)
          )
        );
        visitedSlugs.add(parent.slug);
      }
    }
  });

  // the current page is the last item in the breadcrumb
  elements.push(
    JsonLd.listItem(elements.length + 1, title, toUrl(domain, node.slug))
  );

  return JsonLd.breadcrumbList(elements);
}
