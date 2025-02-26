import "server-only";

import { notFound } from "next/navigation";

import { FernNavigation } from "@fern-api/fdr-sdk";

import ApiEndpointPage from "@/components/api-reference/ApiEndpointPage";
import { BottomNavigation } from "@/components/bottom-nav";
import ChangelogEntryPage from "@/components/changelog/ChangelogEntryPage";
import ChangelogPage, {
  ChangelogPageEntry,
  ChangelogPageOverview,
} from "@/components/changelog/ChangelogPage";
import { LayoutEvaluator } from "@/components/layouts/LayoutEvaluator";
import { DocsLoader } from "@/server/docs-loader";
import { MdxSerializer } from "@/server/mdx-serializer";

export async function DocsMainContent({
  loader,
  serialize,
  node,
  parents,
  neighbors,
  breadcrumb,
}: {
  loader: DocsLoader;
  serialize: MdxSerializer;
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
}) {
  const bottomNavigation = neighbors && (
    <BottomNavigation neighbors={neighbors} serialize={serialize} />
  );

  if (node.type === "changelog") {
    return (
      <ChangelogPage
        loader={loader}
        serialize={serialize}
        nodeId={node.id}
        breadcrumb={breadcrumb}
      />
    );
  }

  if (node.type === "changelogEntry") {
    const changelogNode = parents.findLast(
      (parent) => parent.type === "changelog"
    );
    if (changelogNode == null) {
      throw new Error("Changelog node not found");
    }
    return (
      <ChangelogEntryPage
        node={node}
        overview={
          <ChangelogPageOverview
            loader={loader}
            serialize={serialize}
            node={changelogNode}
            breadcrumb={breadcrumb.slice(0, -3)}
          />
        }
        bottomNavigation={bottomNavigation}
      >
        <ChangelogPageEntry loader={loader} node={node} serialize={serialize} />
      </ChangelogEntryPage>
    );
  }

  if (FernNavigation.isApiLeaf(node)) {
    return (
      <ApiEndpointPage
        loader={loader}
        serialize={serialize}
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
        serialize={serialize}
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
