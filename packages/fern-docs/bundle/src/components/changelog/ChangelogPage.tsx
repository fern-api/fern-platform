import "server-only";

import { notFound } from "next/navigation";

import { compact } from "es-toolkit/compat";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { type TableOfContentsItem, makeToc, toTree } from "@fern-docs/mdx";

import { getFernToken } from "@/app/fern-token";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { createCachedMdxSerializer } from "@/server/mdx-serializer";

import { FernLink } from "../components/FernLink";
import { PageHeader } from "../components/PageHeader";
import { Markdown } from "../mdx/Markdown";
import { MdxContent } from "../mdx/MdxContent";
import ChangelogPageClient from "./ChangelogPageClient";

export default async function ChangelogPage({
  domain,
  nodeId,
  breadcrumb,
}: {
  domain: string;
  nodeId: FernNavigation.NodeId;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}) {
  const loader = await createCachedDocsLoader(domain, await getFernToken());
  const node = await loader.getNavigationNode(nodeId);
  if (node.type !== "changelog") {
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
          domain={domain}
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
              node={entry}
              domain={domain}
            />,
          ] as const;
        })
      )}
    />
  );
}

async function ChangelogPageOverview({
  domain,
  node,
  breadcrumb,
}: {
  domain: string;
  node: FernNavigation.ChangelogNode;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}) {
  const loader = await createCachedDocsLoader(domain);
  const page =
    node.overviewPageId != null
      ? await loader.getPage(node.overviewPageId)
      : undefined;
  const serialize = createCachedMdxSerializer(domain);
  const mdx = await serialize(page?.markdown, {
    filename: node.overviewPageId,
  });

  return (
    <>
      <PageHeader
        domain={domain}
        title={mdx?.frontmatter?.title ?? node.title}
        subtitle={mdx?.frontmatter?.subtitle ?? mdx?.frontmatter?.excerpt}
        breadcrumb={breadcrumb}
      />
      <Markdown mdx={mdx} fallback={page?.markdown} />
    </>
  );
}

async function ChangelogPageEntry({
  domain,
  node,
}: {
  domain: string;
  node: FernNavigation.ChangelogEntryNode;
}) {
  const loader = await createCachedDocsLoader(domain);
  const page = await loader.getPage(node.pageId);
  const serialize = createCachedMdxSerializer(domain);
  const mdx = await serialize(page.markdown, {
    filename: node.pageId,
  });

  const title = await serialize(mdx?.frontmatter?.title);

  return (
    <Markdown
      mdx={mdx}
      title={
        title != null ? (
          <h2>
            <FernLink href={node.slug} className="not-prose">
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
