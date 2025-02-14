import "server-only";

import React from "react";

import { Separator } from "@radix-ui/react-separator";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MaybeFernLink } from "@/components/components/FernLink";
import { MdxServerComponentSuspense } from "@/components/mdx/server-component";
import { DocsLoader } from "@/server/docs-loader";

export function BottomNavigation({
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
  if (neighbors.prev == null && neighbors.next == null) {
    return <Separator className="h-px bg-[var(--grayscale-a5)]" />;
  }

  return (
    <nav
      aria-label="Up next"
      className="flex rounded-[calc(var(--border-radius))] bg-[var(--grayscale-a3)] p-1 [&>a]:rounded-[calc(var(--border-radius)-4px)]"
    >
      {neighbors.prev && (
        <MaybeFernLink
          href={neighbors.prev.href}
          className="flex h-16 shrink-0 items-center gap-1 px-3 pr-6"
        >
          <ChevronLeft className="size-icon text-[var(--grayscale-a9)]" />
          <span className="hidden text-sm font-medium text-[var(--grayscale-a11)] sm:block">
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
              <MdxServerComponentSuspense
                loader={loader}
                mdx={neighbors.next.title}
                fallback={neighbors.next.title}
              />
            </h4>
            {neighbors.next.excerpt && (
              <div className="truncate text-sm text-[var(--grayscale-a11)]">
                <MdxServerComponentSuspense
                  loader={loader}
                  mdx={neighbors.next.excerpt}
                  fallback={neighbors.next.excerpt}
                />
              </div>
            )}
          </div>
          <Separator
            orientation="vertical"
            className="hidden h-8 w-px bg-[var(--grayscale-a5)] sm:block"
          />
          <span className="inline-flex items-center gap-1">
            <span className="hidden text-sm font-medium text-[var(--grayscale-a11)] sm:block">
              Next
            </span>
            <ChevronRight className="size-icon text-[var(--grayscale-a9)]" />
          </span>
        </MaybeFernLink>
      )}
    </nav>
  );
}
