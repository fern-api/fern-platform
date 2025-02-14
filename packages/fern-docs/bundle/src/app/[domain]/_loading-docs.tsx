"use client";

import { cn } from "@fern-docs/components";

import { useLayout } from "@/state/layout";

export default function LoadingDocs() {
  const layout = useLayout();
  return (
    <div className="max-w-page-width mx-auto flex w-full flex-1 flex-row-reverse">
      {layout === "guide" ||
        (layout === "overview" && (
          <aside className="w-sidebar-width shink-0 flex flex-col gap-2">
            <div className="h-4 w-32 rounded-md bg-[var(--grayscale-a3)]" />
            <div className="h-4 w-32 rounded-md bg-[var(--grayscale-a3)]" />
            <div className="h-4 w-32 rounded-md bg-[var(--grayscale-a3)]" />
          </aside>
        ))}
      <article
        className={cn("mx-auto min-w-0 shrink", {
          "w-content-width": layout === "guide",
          "w-content-wide-width": layout === "overview",
          "w-page-width": layout === "page" || layout === "custom",
          "w-endpoint-width": layout === "reference",
        })}
      >
        <header className="my-8">
          <div className="h-6 w-64 rounded-md bg-[var(--grayscale-a3)]" />
        </header>
        <section className="my-8 space-y-2">
          <div className="h-4 w-80 rounded-md bg-[var(--grayscale-a3)]" />
          <div className="h-4 w-80 rounded-md bg-[var(--grayscale-a3)]" />
          <div className="h-4 w-80 rounded-md bg-[var(--grayscale-a3)]" />
        </section>
      </article>
    </div>
  );
}
