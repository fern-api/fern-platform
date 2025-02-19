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
      {toc}
      <div className="px-page-padding mx-auto mb-12 shrink space-y-8 lg:ml-0 xl:ml-auto">
        <article className="w-content-wide-width max-w-full">
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
