import { notFound } from "next/navigation";

import { FernNavigation } from "@fern-api/fdr-sdk";

import ApiEndpointPage from "@/components/api-reference/ApiEndpointPage";
import ChangelogEntryPage from "@/components/changelog/ChangelogEntryPage";
import ChangelogPage from "@/components/changelog/ChangelogPage";
import { LayoutEvaluator } from "@/components/layouts/LayoutEvaluator";
import { DocsContent } from "@/components/resolver/DocsContent";

export async function DocsMainContent({
  domain,
  rootslug,
  node,
  parents,
  neighbors,
  breadcrumb,
  scope,
}: {
  domain: string;
  rootslug: FernNavigation.Slug;
  node: FernNavigation.NavigationNodePage;
  parents: readonly FernNavigation.NavigationNodeParent[];
  neighbors: DocsContent.Neighbors;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  scope?: Record<string, unknown>;
}) {
  const mdxOptions = {
    scope,
    toc: true,
  };

  if (node.type === "changelog") {
    return (
      <ChangelogPage
        domain={domain}
        nodeId={node.id}
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
