import React from "react";

import { cn } from "@fern-docs/components";

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
      <aside
        role="directory"
        className={cn(
          "top-(--header-height) sticky order-last hidden h-fit max-h-[calc(100dvh-var(--header-height))] flex-col xl:flex",
          "w-(--spacing-sidebar-width)"
        )}
      >
        {toc}
      </aside>
      <div className="px-page-padding mx-auto mb-12 flex min-w-0 shrink lg:ml-0 xl:ml-auto">
        <article className="w-content-wide-width min-w-0 shrink">
          {header}
          <div className="prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full break-words">
            {children}
          </div>
          {footer}
        </article>
      </div>
    </>
  );
}
