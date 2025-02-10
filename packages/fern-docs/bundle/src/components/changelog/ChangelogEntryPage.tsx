import { notFound } from "next/navigation";

import type { FernNavigation } from "@fern-api/fdr-sdk";

import { createCachedDocsLoader } from "@/server/docs-loader";

import type { FernSerializeMdxOptions } from "../mdx/types";
import type { DocsContent } from "../resolver/DocsContent";
import ChangelogEntryPageClient from "./ChangelogEntryPageClient";

export default async function ChangelogEntryPage({
  parents,
  domain,
  node,
  mdxOptions,
  breadcrumb,
  neighbors,
}: {
  parents: readonly FernNavigation.NavigationNodeParent[];
  domain: string;
  node: FernNavigation.ChangelogEntryNode;
  mdxOptions: Omit<FernSerializeMdxOptions, "files" | "replaceSrc">;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  neighbors: DocsContent.Neighbors;
}) {
  const docsLoader = await createCachedDocsLoader(domain);
  const changelogNode = [...parents]
    .reverse()
    .find((n): n is FernNavigation.ChangelogNode => n.type === "changelog");
  if (changelogNode == null) {
    notFound();
  }
  const page = await docsLoader.getSerializedPage(node.pageId, mdxOptions);
  if (page == null) {
    notFound();
  }
  return (
    <ChangelogEntryPageClient
      content={{
        ...node,
        type: "changelog-entry",
        changelogTitle: changelogNode.title,
        changelogSlug: changelogNode.slug,
        page,
        breadcrumb,
        neighbors,
      }}
    />
  );
}
