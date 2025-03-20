import "server-only";

import React from "react";

import { Separator } from "@/components/Separator";
import { MdxServerComponent } from "@/mdx/components/server-component";
import { MdxSerializer } from "@/server/mdx-serializer";

import { BottomNavigationClient } from "./bottom-nav-client";

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
    return <Separator />;
  }

  const nextTitle = neighbors.next && (
    <React.Suspense fallback={neighbors.next.title}>
      <MdxServerComponent serialize={serialize} mdx={neighbors.next.title} />
    </React.Suspense>
  );

  const nextExcerpt = neighbors.next && (
    <React.Suspense fallback={neighbors.next.excerpt}>
      <MdxServerComponent serialize={serialize} mdx={neighbors.next.excerpt} />
    </React.Suspense>
  );

  return (
    <BottomNavigationClient
      prev={neighbors.prev ? { href: neighbors.prev.href } : undefined}
      next={
        neighbors.next
          ? {
              title: nextTitle,
              excerpt: nextExcerpt,
              href: neighbors.next.href,
            }
          : undefined
      }
    />
  );
}
