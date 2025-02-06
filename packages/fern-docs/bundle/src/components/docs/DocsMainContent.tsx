"use server";

import { createCachedDocsLoader } from "@/server/docs-loader";
import { createFileResolver } from "@/server/file-resolver";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { notFound } from "next/navigation";
// import ApiEndpointPage from "../api-reference/ApiEndpointPage";
// import ApiReferencePage from "../api-reference/ApiReferencePage";
import ChangelogEntryPage from "../changelog/ChangelogEntryPage";
// import ChangelogPage from "../changelog/ChangelogPage";
import { LayoutEvaluator } from "../layouts/LayoutEvaluator";
import { FernSerializeMdxOptions } from "../mdx/types";
import type { DocsContent } from "../resolver/DocsContent";

export async function DocsMainContent({
  domain,
  node,
  parents,
  neighbors,
  breadcrumb,
  // apiReferenceNodes,
  scope,
}: {
  domain: string;
  node: FernNavigation.NavigationNodePage;
  // apiReference: FernNavigation.ApiReferenceNode | undefined;
  parents: readonly FernNavigation.NavigationNodeParent[];
  neighbors: DocsContent.Neighbors;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  scope?: Record<string, unknown>;
}) {
  const docsLoader = await createCachedDocsLoader(domain);
  const fileResolver = await createFileResolver(docsLoader);
  const mdxOptions: Omit<FernSerializeMdxOptions, "files"> = {
    scope,
    replaceSrc: fileResolver,
    toc: true,
  };

  // if (node.type === "changelog") {
  //   return <ChangelogPage node={node} parents={parents} />;
  // }

  if (node.type === "changelogEntry") {
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
      <ChangelogEntryPage
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

  // if (apiReference.type === "apiReference" && !node.paginated) {
  //   return <ApiReferencePage node={node} />;
  // }

  // if (FernNavigation.isApiLeaf(node)) {
  //   return <ApiEndpointPage node={node} />;
  // }

  const pageId = FernNavigation.getPageId(node);
  if (pageId != null) {
    const page = await docsLoader.getSerializedPage(pageId, mdxOptions);
    if (page == null) {
      notFound();
    }

    return (
      <LayoutEvaluator
        domain={domain}
        fallbackTitle={node.title}
        mdx={page}
        breadcrumb={breadcrumb}
        hasAside={false}
      />
    );
  }

  notFound();
}
