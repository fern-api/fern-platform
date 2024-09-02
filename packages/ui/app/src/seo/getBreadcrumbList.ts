import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { JsonLd } from "@fern-ui/next-seo";
import urljoin from "url-join";
import { getFrontmatter } from "../mdx/frontmatter";

function toUrl(domain: string, slug: FernNavigation.Slug): string {
    return urljoin(`https://${domain}`, slug);
}

export function getBreadcrumbList(
    domain: string,
    pages: Record<string, DocsV1Read.PageContent>,
    parents: FernNavigation.NavigationNode[],
    node: FernNavigation.NavigationNodePage,
): JsonLd.BreadcrumbListSchema {
    let title = node.title;

    if (FernNavigation.isPage(node)) {
        const pageId = FernNavigation.utils.getPageId(node);
        if (pageId != null) {
            const page = pages[pageId];
            if (page != null) {
                const { data: frontmatter } = getFrontmatter(page.markdown);

                // if the frontmatter has a jsonld:breadcrumb, use that
                if (frontmatter["jsonld:breadcrumb"] != null) {
                    const breadcrumb = JsonLd.BreadcrumbListSchema.safeParse(frontmatter["jsonld:breadcrumb"]);
                    if (breadcrumb.success) {
                        return breadcrumb.data;
                    } else {
                        // eslint-disable-next-line no-console
                        console.error("Invalid jsonld:breadcrumb", breadcrumb.error.toString());
                    }
                }

                // override the title used in the breadcrumb's last item.
                // for example, if the sidebar's title is "Overview" but the page title is "This API Overview"
                if (frontmatter.title != null) {
                    title = frontmatter.title;
                }
            }
        }
    }

    const elements: JsonLd.ListElementSchema[] = [];
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
