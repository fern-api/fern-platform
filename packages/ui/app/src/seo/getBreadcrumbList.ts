import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getFrontmatter } from "@fern-ui/fern-docs-mdx";
import { JsonLd } from "@fern-ui/next-seo";
import urljoin from "url-join";

function toUrl(domain: string, slug: FernNavigation.Slug): string {
    return urljoin(withDefaultProtocol(domain), slug);
}

export function getBreadcrumbList(
    domain: string,
    pages: Record<string, DocsV1Read.PageContent>,
    parents: readonly FernNavigation.NavigationNode[],
    node: FernNavigation.NavigationNodePage,
): FernDocs.JsonLdBreadcrumbList {
    let title = node.title;

    if (FernNavigation.isPage(node)) {
        const pageId = FernNavigation.getPageId(node);
        if (pageId != null) {
            const page = pages[pageId];
            if (page != null) {
                const { data: frontmatter } = getFrontmatter(page.markdown);

                // if the frontmatter has a jsonld:breadcrumb, use that
                if (frontmatter["jsonld:breadcrumb"] != null) {
                    return frontmatter["jsonld:breadcrumb"];
                }

                // override the title used in the breadcrumb's last item.
                // for example, if the sidebar's title is "Overview" but the page title is "This API Overview"
                if (frontmatter.title != null) {
                    title = frontmatter.title;
                }
            }
        }
    }

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
                elements.push(JsonLd.listItem(elements.length + 1, parent.title, toUrl(domain, slug)));
                visitedSlugs.add(parent.slug);
            }
        }
    });

    // the current page is the last item in the breadcrumb
    elements.push(JsonLd.listItem(elements.length + 1, title, toUrl(domain, node.slug)));

    return JsonLd.breadcrumbList(elements);
}
