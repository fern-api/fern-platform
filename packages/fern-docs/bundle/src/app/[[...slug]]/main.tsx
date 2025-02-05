"use client";

import { cn } from "@fern-docs/components";

export default function Main({
  layout,
  children,
  contentWidth,
  pageWidth,
  sidebarWidth,
}: {
  layout: "custom" | "guide" | "overview" | "page" | "reference";
  children: React.ReactNode;
  contentWidth: number;
  pageWidth: number | undefined;
  sidebarWidth: number;
}) {
  if (layout === "custom") {
    return <main className="mt-[var(--header-height)]">{children}</main>;
  }
  return (
    <main
      className={cn(
        "mt-[var(--header-height)] flex flex-1 flex-row-reverse",
        "[&_article]:mx-auto",
        {
          "[&_article]:max-w-[var(--spacing-content-width)]":
            layout === "guide",
        }
      )}
    >
      {children}
    </main>
  );
}
