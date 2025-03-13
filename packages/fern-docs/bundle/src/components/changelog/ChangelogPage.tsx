import "server-only";

import { notFound } from "next/navigation";

import { compact } from "es-toolkit/compat";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { type TableOfContentsItem, makeToc, toTree } from "@fern-docs/mdx";
import { slugToHref } from "@fern-docs/utils";

import { FernLink } from "@/components/FernLink";
import { PageHeader } from "@/components/PageHeader";
import { Markdown } from "@/mdx/components/Markdown";
import { MdxContent } from "@/mdx/components/MdxContent";
import { DocsLoader } from "@/server/docs-loader";
import { MdxSerializer } from "@/server/mdx-serializer";

import ChangelogPageClient from "./ChangelogPageClient";

export default async function ChangelogPage({
  loader,
  serialize,
  nodeId,
  breadcrumb,
}: {
  loader: DocsLoader;
  serialize: MdxSerializer;
  nodeId: FernNavigation.NodeId;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}) {
  const node = await loader.getNavigationNode(nodeId);
  if (node.type !== "changelog") {
    console.debug(
      `[${loader.domain}] Found non-changelog node for nodeId: ${nodeId}`
    );
    notFound();
  }

  const entries: FernNavigation.ChangelogEntryNode[] = [];
  FernNavigation.traverseDF(node, (n) => {
    if (n.type === "changelogEntry") {
      entries.push(n);
    }
  });
  const pageIds = entries.map((e) => e.pageId);
  const pages = (
    await Promise.all(
      compact([node.overviewPageId, ...pageIds]).map(async (pageId) => {
        const markdown = await loader.getPage(pageId);
        return {
          pageId,
          anchors: getAnchorIds(makeToc(toTree(markdown.markdown).hast)),
        };
      })
    )
  ).filter(isNonNullish);

  /**
   * if there are duplicate anchor tags, the anchor from the first page where it appears will be used
   */
  const anchorIds: Record<string, FernNavigation.PageId> = {};
  pages.forEach(({ anchors, pageId }) => {
    anchors.forEach((anchorId) => {
      if (anchorId && !anchorIds[anchorId]) {
        anchorIds[anchorId] = pageId;
      }
    });
  });

  return (
    <ChangelogPageClient
      node={node}
      anchorIds={anchorIds}
      overview={
        <ChangelogPageOverview
          loader={loader}
          serialize={serialize}
          node={node}
          breadcrumb={breadcrumb}
        />
      }
      entries={Object.fromEntries(
        entries.map((entry) => {
          return [
            entry.pageId,
            <ChangelogPageEntry
              key={entry.pageId}
              loader={loader}
              node={entry}
              serialize={serialize}
            />,
          ] as const;
        })
      )}
    />
  );
}

export async function ChangelogPageOverview({
  loader,
  serialize,
  node,
  breadcrumb,
}: {
  loader: DocsLoader;
  serialize: MdxSerializer;
  node: FernNavigation.ChangelogNode;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}) {
  const page =
    node.overviewPageId != null
      ? await loader.getPage(node.overviewPageId)
      : undefined;
  const mdx = await serialize(page?.markdown, {
    filename: page?.filename,
    slug: node.slug,
  });

  return (
    <>
      <PageHeader
        serialize={serialize}
        title={mdx?.frontmatter?.title ?? node.title}
        titleHref={slugToHref(node.slug)}
        subtitle={mdx?.frontmatter?.subtitle ?? mdx?.frontmatter?.excerpt}
        breadcrumb={breadcrumb}
        slug={node.slug}
      />
      <Markdown mdx={mdx} fallback={page?.markdown} />
    </>
  );
}

export async function ChangelogPageEntry({
  loader,
  serialize,
  node,
}: {
  loader: DocsLoader;
  serialize: MdxSerializer;
  node: FernNavigation.ChangelogEntryNode;
}) {
  const page = await loader.getPage(node.pageId);
  const mdx = await serialize(page.markdown, {
    filename: page.filename,
    slug: node.slug,
  });

  const title = await serialize(mdx?.frontmatter?.title, {
    filename: page.filename,
    slug: node.slug,
  });

  return (
    <Markdown
      mdx={mdx}
      title={
        title != null ? (
          <h2>
            <FernLink
              href={slugToHref(node.slug)}
              className="not-prose"
              scroll={true}
            >
              <MdxContent mdx={title} />
            </FernLink>
          </h2>
        ) : undefined
      }
    />
  );
}

function getAnchorIds(toc: TableOfContentsItem[]): string[] {
  return toc.flatMap((item) => {
    return [item.anchorString, ...getAnchorIds(item.children ?? [])];
  });
}
