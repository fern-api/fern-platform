import { notFound } from "next/navigation";

import { FernNavigation } from "@fern-api/fdr-sdk";

import ApiEndpointPage from "@/components/api-reference/ApiEndpointPage";
import ChangelogEntryPage from "@/components/changelog/ChangelogEntryPage";
import ChangelogPage from "@/components/changelog/ChangelogPage";
import { LayoutEvaluator } from "@/components/layouts/LayoutEvaluator";
import { DocsLoader } from "@/server/docs-loader";

import { BottomNavigation } from "./bottom-nav";

export async function DocsMainContent({
  loader,
  node,
  parents,
  neighbors,
  breadcrumb,
  // scope,
}: {
  loader: DocsLoader;
  node: FernNavigation.NavigationNodePage;
  parents: readonly FernNavigation.NavigationNodeParent[];
  neighbors?: {
    prev?: {
      title: string;
      href: string;
      excerpt?: string;
    };
    next?: {
      title: string;
      href: string;
      excerpt?: string;
    };
  };
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  scope?: Record<string, unknown>;
}) {
  const bottomNavigation = neighbors && (
    <BottomNavigation neighbors={neighbors} loader={loader} />
  );

  if (node.type === "changelog") {
    return (
      <ChangelogPage loader={loader} nodeId={node.id} breadcrumb={breadcrumb} />
    );
  }

  if (node.type === "changelogEntry") {
    return (
      <ChangelogEntryPage
        node={node}
        parents={parents}
        domain={loader.domain}
        breadcrumb={breadcrumb}
        neighbors={{
          prev: null,
          next: null,
        }}
      />
    );
  }

  if (FernNavigation.isApiLeaf(node)) {
    return (
      <ApiEndpointPage
        loader={loader}
        node={node}
        breadcrumb={breadcrumb}
        bottomNavigation={bottomNavigation}
      />
    );
  }

  const pageId = FernNavigation.getPageId(node);
  if (pageId != null) {
    return (
      <LayoutEvaluator
        loader={loader}
        fallbackTitle={node.title}
        pageId={pageId}
        breadcrumb={breadcrumb}
        bottomNavigation={bottomNavigation}
      />
    );
  }

  console.error(`[${loader.domain}] Unknown node type: ${node.type}`);
  notFound();
}
