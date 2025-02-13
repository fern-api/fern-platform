import "server-only";

import { notFound } from "next/navigation";

import type { FernNavigation } from "@fern-api/fdr-sdk";

import { createCachedDocsLoader } from "@/server/docs-loader";
import { createCachedMdxSerializer } from "@/server/mdx-serializer";

import type { DocsContent } from "../resolver/DocsContent";
import ChangelogEntryPageClient from "./ChangelogEntryPageClient";

export default async function ChangelogEntryPage({
  parents,
  domain,
  node,
  breadcrumb,
  neighbors,
}: {
  parents: readonly FernNavigation.NavigationNodeParent[];
  domain: string;
  node: FernNavigation.ChangelogEntryNode;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  neighbors: DocsContent.Neighbors;
}) {
  const loader = await createCachedDocsLoader(domain);
  const changelogNode = [...parents]
    .reverse()
    .find((n): n is FernNavigation.ChangelogNode => n.type === "changelog");
  if (changelogNode == null) {
    notFound();
  }
  const { filename, markdown } = await loader.getPage(node.pageId);
  const serialize = createCachedMdxSerializer(loader);
  const page = await serialize(markdown, { filename });

  return (
    <ChangelogEntryPageClient
      content={{
        ...node,
        type: "changelog-entry",
        changelogTitle: changelogNode.title,
        changelogSlug: changelogNode.slug,
        page: page ?? markdown,
        breadcrumb,
        neighbors,
      }}
    />
  );
}
