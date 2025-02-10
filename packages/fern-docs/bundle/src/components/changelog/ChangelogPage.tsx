import ChangelogPageClient from "./ChangelogPageClient";

import { createCachedDocsLoader } from "@/server/docs-loader";
import { FernDocs, FernNavigation } from "@fern-api/fdr-sdk";
import { EMPTY_FRONTMATTER } from "@fern-api/fdr-sdk/docs";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { makeToc, TableOfContentsItem, toTree } from "@fern-docs/mdx";
import { compact } from "es-toolkit/compat";
import { FernLink } from "../components/FernLink";
import { PageHeader } from "../components/PageHeader";
import { Markdown } from "../mdx/Markdown";
import { MdxContent } from "../mdx/MdxContent";
import type { FernSerializeMdxOptions } from "../mdx/types";

export default async function ChangelogPage({
  domain,
  node,
  mdxOptions,
  breadcrumb,
}: {
  domain: string;
  node: FernNavigation.ChangelogNode;
  mdxOptions: Omit<FernSerializeMdxOptions, "files" | "replaceSrc">;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}) {
  const docsLoader = await createCachedDocsLoader(domain);
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
        const markdown = await docsLoader.getPage(pageId);
        if (markdown == null) {
          return;
        }
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
          mdxOptions={mdxOptions}
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
              mdxOptions={mdxOptions}
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
  mdxOptions,
  breadcrumb,
}: {
  domain: string;
  node: FernNavigation.ChangelogNode;
  mdxOptions: Omit<FernSerializeMdxOptions, "files" | "replaceSrc">;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}) {
  const docsLoader = await createCachedDocsLoader(domain);
  const mdx =
    node.overviewPageId != null
      ? await docsLoader.getSerializedPage(node.overviewPageId, mdxOptions)
      : undefined;

  const frontmatter: FernDocs.Frontmatter =
    (typeof mdx !== "string" ? mdx?.frontmatter : undefined) ??
    EMPTY_FRONTMATTER;

  return (
    <>
      <PageHeader
        domain={domain}
        title={frontmatter.title ?? node.title}
        subtitle={frontmatter.subtitle ?? frontmatter.excerpt}
        breadcrumb={breadcrumb}
      />
      <Markdown mdx={mdx} />
    </>
  );
}

async function ChangelogPageEntry({
  domain,
  node,
  mdxOptions,
}: {
  domain: string;
  node: FernNavigation.ChangelogEntryNode;
  mdxOptions: Omit<FernSerializeMdxOptions, "files" | "replaceSrc">;
}) {
  const docsLoader = await createCachedDocsLoader(domain);
  const mdx = await docsLoader.getSerializedPage(node.pageId, mdxOptions);

  const frontmatter: FernDocs.Frontmatter =
    (typeof mdx !== "string" ? mdx?.frontmatter : undefined) ??
    EMPTY_FRONTMATTER;

  const title = await docsLoader.serializeMdx(frontmatter.title);

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
