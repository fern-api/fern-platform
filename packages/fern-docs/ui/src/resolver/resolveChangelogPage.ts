import type { DocsV1Read } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { isNonNullish } from "@fern-api/ui-core-utils";
import type { MDX_SERIALIZER } from "../mdx/bundler";
import type { FernSerializeMdxOptions } from "../mdx/types";
import type { DocsContent } from "./DocsContent";
import { parseMarkdownPageToAnchorTag } from "./parseMarkdownPageToAnchorTag";

interface ResolveChangelogPageOptions {
  node: FernNavigation.ChangelogNode;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  pages: Record<string, DocsV1Read.PageContent>;
  serializeMdx: MDX_SERIALIZER;
  mdxOptions: FernSerializeMdxOptions | undefined;
}

export async function resolveChangelogPage({
  node,
  breadcrumb,
  pages,
  serializeMdx,
  mdxOptions,
}: ResolveChangelogPageOptions): Promise<DocsContent.ChangelogPage> {
  const pageIds = new Set<FernNavigation.PageId>();
  FernNavigation.traverseDF(node, (n) => {
    if (FernNavigation.hasMarkdown(n)) {
      const pageId = FernNavigation.getPageId(n);
      if (pageId != null) {
        pageIds.add(pageId);
      }
    }
  });
  const allPages = Object.fromEntries(
    Object.entries(pages).map(([key, value]) => {
      return [key, value.markdown];
    })
  );
  const pageRecords = (
    await Promise.all(
      [...pageIds].map(async (pageId) => {
        const pageContent = pages[pageId];
        if (pageContent == null) {
          return;
        }
        return {
          pageId,
          markdown: await serializeMdx(pageContent.markdown, {
            ...mdxOptions,
            filename: pageId,
            files: { ...(mdxOptions?.files ?? {}), ...allPages },
          }),
          anchorTag: parseMarkdownPageToAnchorTag(pageContent.markdown),
        };
      })
    )
  ).filter(isNonNullish);

  const markdown =
    node.overviewPageId != null
      ? pages[node.overviewPageId]?.markdown
      : undefined;

  const page =
    markdown != null
      ? await serializeMdx(markdown, {
          ...mdxOptions,
          filename: node.overviewPageId,
        })
      : undefined;

  /**
   * if there are duplicate anchor tags, the anchor from the first page where it appears will be used
   */
  const anchorIds: Record<string, FernNavigation.PageId> = {};
  pageRecords.forEach((record) => {
    if (record.anchorTag != null && anchorIds[record.anchorTag] == null) {
      anchorIds[record.anchorTag] = record.pageId;
    }
  });

  return {
    type: "changelog",
    breadcrumb,
    title:
      (page != null && typeof page !== "string"
        ? page.frontmatter.title
        : undefined) ?? node.title,
    node,
    pages: Object.fromEntries(
      pageRecords.map((record) => [record.pageId, record.markdown])
    ),
    // items: await Promise.all(itemsPromise),
    // neighbors,
    slug: node.slug,
    anchorIds,
  };
}
