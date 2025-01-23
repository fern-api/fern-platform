import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { DocsLoader } from "@fern-docs/cache";
import type { MDX_SERIALIZER } from "../mdx/bundler";
import type { FernSerializeMdxOptions } from "../mdx/types";
import type { DocsContent } from "./DocsContent";
import { parseMarkdownPageToAnchorTag } from "./parseMarkdownPageToAnchorTag";

interface ResolveChangelogPageOptions {
  node: FernNavigation.ChangelogNode;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  loader: DocsLoader;
  serializeMdx: MDX_SERIALIZER;
  mdxOptions: FernSerializeMdxOptions | undefined;
}

export async function resolveChangelogPage({
  node,
  breadcrumb,
  loader,
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
  const pageRecords = (
    await Promise.all(
      [...pageIds].map(async (pageId) => {
        const pageContent = await loader.getPage(pageId);
        if (pageContent == null) {
          return;
        }
        return {
          pageId,
          markdown: await serializeMdx(pageContent.markdown, {
            ...mdxOptions,
            filename: pageId,
            files: mdxOptions?.files,
          }),
          anchorTag: parseMarkdownPageToAnchorTag(pageContent.markdown),
        };
      })
    )
  ).filter(isNonNullish);

  const markdown =
    node.overviewPageId != null
      ? await loader.getPage(node.overviewPageId).then((page) => page?.markdown)
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
