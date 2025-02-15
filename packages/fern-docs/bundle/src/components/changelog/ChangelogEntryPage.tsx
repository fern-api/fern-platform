import "server-only";

import { notFound } from "next/navigation";

import type { FernNavigation } from "@fern-api/fdr-sdk";

import { DocsLoader } from "@/server/docs-loader";
import { MdxSerializer } from "@/server/mdx-serializer";

import type { DocsContent } from "../resolver/DocsContent";
import ChangelogEntryPageClient from "./ChangelogEntryPageClient";

export default async function ChangelogEntryPage({
  parents,
  loader,
  serialize,
  node,
  breadcrumb,
  neighbors,
}: {
  parents: readonly FernNavigation.NavigationNodeParent[];
  loader: DocsLoader;
  serialize: MdxSerializer;
  node: FernNavigation.ChangelogEntryNode;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  neighbors: DocsContent.Neighbors;
}) {
  const changelogNode = [...parents]
    .reverse()
    .find((n): n is FernNavigation.ChangelogNode => n.type === "changelog");
  if (changelogNode == null) {
    notFound();
  }
  const { filename, markdown } = await loader.getPage(node.pageId);
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
