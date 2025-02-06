"use server";

import { createCachedDocsLoader } from "@/server/docs-loader";
import { createFileResolver } from "@/server/file-resolver";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { notFound } from "next/navigation";
// import ApiEndpointPage from "../api-reference/ApiEndpointPage";
// import ApiReferencePage from "../api-reference/ApiReferencePage";
import ChangelogEntryPage from "../changelog/ChangelogEntryPage";
// import ChangelogPage from "../changelog/ChangelogPage";
import { serializeMdx } from "../mdx/bundlers/mdx-bundler";
import { FernSerializeMdxOptions } from "../mdx/types";
import type { DocsContent } from "../resolver/DocsContent";
import { resolveMarkdownPage } from "../resolver/resolveMarkdownPage";
import MarkdownPage from "./MarkdownPage";

export async function DocsMainContent({
  node,
  parents,
  neighbors,
  breadcrumb,
  apiReferenceNodes,
  scope,
}: {
  node: FernNavigation.NavigationNodePage;
  // apiReference: FernNavigation.ApiReferenceNode | undefined;
  parents: readonly FernNavigation.NavigationNodeParent[];
  neighbors: DocsContent.Neighbors;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  scope?: Record<string, unknown>;
}) {
  const docsLoader = await createCachedDocsLoader();
  const mdxBundlerFiles = await docsLoader.getMdxBundlerFiles();
  const fileResolver = await createFileResolver(docsLoader);
  const mdxOptions: FernSerializeMdxOptions = {
    files: mdxBundlerFiles,
    scope,
    replaceSrc: fileResolver,
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
    const loadedPage = await docsLoader.getPage(node.pageId);
    if (!loadedPage) {
      notFound();
    }
    const page = await serializeMdx(loadedPage.markdown, mdxOptions);
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
    const content = await docsLoader.getPage(pageId);
    if (!content) {
      notFound();
    }

    const page = await serializeMdx(content.markdown, mdxOptions);

    return <MarkdownPage content={resolveMarkdownPage()} />;
  }

  notFound();
}
