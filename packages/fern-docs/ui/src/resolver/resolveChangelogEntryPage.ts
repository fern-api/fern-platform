import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { DocsLoader } from "@fern-docs/cache";
import { getFrontmatter } from "@fern-docs/mdx";
import type { MDX_SERIALIZER } from "../mdx/bundler";
import type { FernSerializeMdxOptions } from "../mdx/types";
import type { DocsContent } from "./DocsContent";

interface ResolveChangelogEntryPageOptions {
  node: FernNavigation.ChangelogEntryNode;
  parents: readonly FernNavigation.NavigationNodeParent[];
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  loader: DocsLoader;
  serializeMdx: MDX_SERIALIZER;
  mdxOptions: FernSerializeMdxOptions | undefined;
  neighbors: DocsContent.Neighbors;
}

export async function resolveChangelogEntryPage({
  node,
  parents,
  breadcrumb,
  loader,
  serializeMdx,
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
      ? await loader
          .getPage(changelogNode.overviewPageId)
          .then((page) => page?.markdown)
      : undefined;
  const changelogTitle =
    (changelogMarkdown != null
      ? getFrontmatter(changelogMarkdown).data.title
      : undefined) ?? changelogNode.title;

  const markdown = await loader
    .getPage(node.pageId)
    .then((page) => page?.markdown);
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
