import type { DocsV1Read } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { getFrontmatter } from "@fern-docs/mdx";

import { serializeMdx } from "../mdx/bundlers/mdx-bundler";
import type { FernSerializeMdxOptions } from "../mdx/types";
import type { DocsContent } from "./DocsContent";

interface ResolveChangelogEntryPageOptions {
  node: FernNavigation.ChangelogEntryNode;
  parents: readonly FernNavigation.NavigationNodeParent[];
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  pages: Record<string, DocsV1Read.PageContent>;
  mdxOptions: FernSerializeMdxOptions | undefined;
  neighbors: DocsContent.Neighbors;
}

export async function resolveChangelogEntryPage({
  node,
  parents,
  breadcrumb,
  pages,
  mdxOptions,
  neighbors,
}: ResolveChangelogEntryPageOptions): Promise<
  DocsContent.ChangelogEntryPage | undefined
> {
  const changelogNode = [...parents]
    .reverse()
    .find((n): n is FernNavigation.ChangelogNode => n.type === "changelog");
  if (changelogNode == null) {
    throw new Error("Changelog node not found");
  }
  const changelogMarkdown =
    changelogNode.overviewPageId != null
      ? pages[changelogNode.overviewPageId]?.markdown
      : undefined;
  const changelogTitle =
    (changelogMarkdown != null
      ? getFrontmatter(changelogMarkdown).data.title
      : undefined) ?? changelogNode.title;

  const markdown = pages[node.pageId]?.markdown;
  if (markdown == null) {
    // TODO: sentry

    console.error("Markdown content not found", node.pageId);
    return;
  }

  const page = await serializeMdx(markdown, {
    ...mdxOptions,
    filename: node.pageId,
  });

  return {
    ...node,
    type: "changelog-entry",
    changelogTitle,
    changelogSlug: changelogNode.slug,
    breadcrumb,
    page,
    neighbors,
  };
}
