import { notFound } from "next/navigation";

import { Separator } from "@radix-ui/react-separator";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { FernNavigation } from "@fern-api/fdr-sdk";

import ApiEndpointPage from "@/components/api-reference/ApiEndpointPage";
import ChangelogEntryPage from "@/components/changelog/ChangelogEntryPage";
import ChangelogPage from "@/components/changelog/ChangelogPage";
import { MaybeFernLink } from "@/components/components/FernLink";
import { LayoutEvaluator } from "@/components/layouts/LayoutEvaluator";
import { MdxServerComponent } from "@/components/mdx/server-component";
import { DocsLoader } from "@/server/docs-loader";

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
      <ApiEndpointPage loader={loader} node={node} breadcrumb={breadcrumb} />
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
        bottomNavigation={
          neighbors && (
            <BottomNavigation neighbors={neighbors} loader={loader} />
          )
        }
      />
    );
  }

  console.error(`[${loader.domain}] Unknown node type: ${node.type}`);
  notFound();
}

function BottomNavigation({
  neighbors,
  loader,
}: {
  loader: DocsLoader;
  neighbors: {
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
}) {
  return (
    <nav className="flex rounded-[calc(var(--border-radius))] bg-[var(--grayscale-a3)] p-1 [&>a]:rounded-[calc(var(--border-radius)-4px)]">
      {neighbors.prev && (
        <MaybeFernLink
          href={neighbors.prev.href}
          className="flex h-16 shrink-0 items-center gap-1 px-3 pr-6"
        >
          <ChevronLeft className="size-icon text-[var(--grayscale-a9)]" />
          <span className="text-sm font-medium text-[var(--grayscale-a11)]">
            Previous
          </span>
        </MaybeFernLink>
      )}
      {neighbors.next && (
        <MaybeFernLink
          href={neighbors.next.href}
          className="bg-background flex h-16 flex-1 items-center justify-end gap-4 border border-transparent px-3 hover:border-[var(--accent-a6)]"
        >
          <div className="min-w-0 shrink space-y-2 pl-4">
            <h4 className="truncate text-base font-bold text-[var(--grayscale-a12)]">
              <MdxServerComponent loader={loader} mdx={neighbors.next.title} />
            </h4>
            {neighbors.next.excerpt && (
              <p className="truncate text-sm text-[var(--grayscale-a11)]">
                <MdxServerComponent
                  loader={loader}
                  mdx={neighbors.next.excerpt}
                />
              </p>
            )}
          </div>
          <Separator
            orientation="vertical"
            className="h-8 w-px bg-[var(--grayscale-a5)]"
          />
          <span className="inline-flex items-center gap-1">
            <span className="text-sm font-medium text-[var(--grayscale-a11)]">
              Next
            </span>
            <ChevronRight className="size-icon text-[var(--grayscale-a9)]" />
          </span>
        </MaybeFernLink>
      )}
    </nav>
  );
}
