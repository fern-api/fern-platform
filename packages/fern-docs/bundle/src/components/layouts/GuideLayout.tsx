import type { ReactElement } from "react";

import { cn } from "@fern-docs/components";

import { SetLayout } from "@/state/layout";

interface GuideLayoutProps {
  header?: React.ReactNode;
  toc?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function GuideLayout({
  header,
  toc,
  children,
  footer,
}: GuideLayoutProps): ReactElement<any> {
  return (
    <>
      <SetLayout value="guide" />
      <aside
        role="directory"
        className={cn(
          "sticky top-(--header-height) order-last hidden h-fit max-h-[calc(100dvh-var(--header-height))] flex-col xl:flex",
          "w-(--spacing-sidebar-width)"
        )}
      >
        {toc}
      </aside>
      <div className="mx-auto mb-12 min-w-0 shrink px-4 md:px-6 lg:ml-0 lg:px-8 xl:ml-auto">
        <article className="w-content-width max-w-full">
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
