import "server-only";

import React from "react";

import { Separator } from "@radix-ui/react-separator";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MaybeFernLink } from "@/components/components/FernLink";
import { MdxServerComponent } from "@/components/mdx/server-component";
import { MdxSerializer } from "@/server/mdx-serializer";

export function BottomNavigation({
  neighbors,
  serialize,
}: {
  serialize: MdxSerializer;
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
    return (
      <Separator orientation="horizontal" className="bg-border-default h-px" />
    );
  }

  return (
    <nav
      aria-label="Up next"
      className="bg-(color:--grayscale-a3) max-w-content-width [&>a]:rounded-1 rounded-2 mx-auto flex p-1"
    >
      {neighbors.prev && (
        <MaybeFernLink
          href={neighbors.prev.href}
          className="flex h-16 shrink-0 items-center gap-1 px-3 pr-6"
        >
          <ChevronLeft className="size-icon text-(color:--grayscale-a9)" />
          <span className="text-(color:--grayscale-a11) hidden text-sm font-medium sm:block">
            Previous
          </span>
        </MaybeFernLink>
      )}
      {neighbors.next && (
        <MaybeFernLink
          href={neighbors.next.href}
          className="bg-background hover:border-(color:--accent-a9) border-(color:--grayscale-a6) flex h-16 min-w-0 flex-1 shrink items-center justify-end gap-4 border px-3"
        >
          <div className="min-w-0 shrink pl-4 text-right">
            <h4 className="text-(color:--grayscale-a12) truncate text-base font-bold">
              <React.Suspense fallback={neighbors.next.title}>
                <MdxServerComponent
                  serialize={serialize}
                  mdx={neighbors.next.title}
                />
              </React.Suspense>
            </h4>
            {neighbors.next.excerpt && (
              <div className="text-(color:--grayscale-a11) truncate text-sm [&_p]:truncate">
                <React.Suspense fallback={neighbors.next.excerpt}>
                  <MdxServerComponent
                    serialize={serialize}
                    mdx={neighbors.next.excerpt}
                  />
                </React.Suspense>
              </div>
            )}
          </div>
          <Separator
            orientation="vertical"
            className="bg-(color:--grayscale-a5) hidden h-8 w-px sm:block"
          />
          <span className="inline-flex items-center gap-1">
            <span className="text-(color:--grayscale-a11) hidden text-sm font-medium sm:block">
              Next
            </span>
            <ChevronRight className="size-icon text-(color:--grayscale-a9)" />
          </span>
        </MaybeFernLink>
      )}
    </nav>
  );
}
