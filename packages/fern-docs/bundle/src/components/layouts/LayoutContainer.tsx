"use client";

import { cn } from "@fern-docs/components";

import { useShouldHideAsides } from "@/state/layout";

export function LayoutContainer({ children }: { children: React.ReactNode }) {
  const hideAsides = useShouldHideAsides();
  return (
    <div
      className={cn("max-w-page-width-padded mx-auto flex flex-row", {
        "[&>aside]:lg:hidden": hideAsides,
      })}
    >
      {children}
    </div>
  );
}
