import React from "react";

import { cn } from "@fern-docs/components";

import { SetLayout } from "@/state/layout";

interface OverviewLayoutProps {
  header?: React.ReactNode;
  toc?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function OverviewLayout({
  header,
  toc,
  children,
  footer,
}: OverviewLayoutProps) {
  return (
    <>
      <SetLayout value="overview" />
      <aside
        role="directory"
        className={cn(
          "sticky top-(--header-height) order-last hidden h-fit max-h-[calc(100dvh-var(--header-height))] flex-col xl:flex",
          "w-(--spacing-sidebar-width)"
        )}
      >
        {toc}
      </aside>
      <article className="max-w-content-wide-width mr-auto ml-0 min-w-0 shrink xl:mx-auto">
        {header}
        <div className="prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full break-words">
          {children}
        </div>
        {footer}
      </article>
    </>
  );
}
