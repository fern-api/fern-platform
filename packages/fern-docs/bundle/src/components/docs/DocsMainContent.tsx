import { FernNavigation } from "@fern-api/fdr-sdk";
import { notFound } from "next/navigation";
import ApiEndpointPage from "../api-reference/ApiEndpointPage";
import ChangelogEntryPage from "../changelog/ChangelogEntryPage";
import ChangelogPage from "../changelog/ChangelogPage";
import { LayoutEvaluator } from "../layouts/LayoutEvaluator";
import { FernSerializeMdxOptions } from "../mdx/types";
import type { DocsContent } from "../resolver/DocsContent";

export async function DocsMainContent({
  domain,
  rootslug,
  node,
  parents,
  neighbors,
  breadcrumb,
  // apiReferenceNodes,
  scope,
}: {
  domain: string;
  rootslug: FernNavigation.Slug;
  node: FernNavigation.NavigationNodePage;
  // apiReference: FernNavigation.ApiReferenceNode | undefined;
  parents: readonly FernNavigation.NavigationNodeParent[];
  neighbors: DocsContent.Neighbors;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  scope?: Record<string, unknown>;
}) {
  const mdxOptions: Omit<FernSerializeMdxOptions, "files" | "replaceSrc"> = {
    scope,
    toc: true,
  };

  if (node.type === "changelog") {
    return (
      <ChangelogPage
        domain={domain}
        node={node}
        breadcrumb={breadcrumb}
        mdxOptions={mdxOptions}
      />
    );
  }

  if (node.type === "changelogEntry") {
    return (
      <ChangelogEntryPage
        node={node}
        parents={parents}
        domain={domain}
        mdxOptions={mdxOptions}
        breadcrumb={breadcrumb}
        neighbors={neighbors}
      />
    );
  }

  if (FernNavigation.isApiLeaf(node)) {
    return (
      <ApiEndpointPage
        node={node}
        domain={domain}
        breadcrumb={breadcrumb}
        rootslug={rootslug}
      />
    );
  }

  const pageId = FernNavigation.getPageId(node);
  if (pageId != null) {
    return (
      <LayoutEvaluator
        domain={domain}
        fallbackTitle={node.title}
        pageId={pageId}
        breadcrumb={breadcrumb}
        hasAside={false}
      />
    );
  }

  console.error(`[${domain}] Unknown node type: ${node.type}`);
  notFound();
}
