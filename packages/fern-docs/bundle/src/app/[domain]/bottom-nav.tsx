import "server-only";

import { Separator } from "@radix-ui/react-separator";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MaybeFernLink } from "@/components/components/FernLink";
import { MdxServerComponent } from "@/components/mdx/server-component";
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
    return null;
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
