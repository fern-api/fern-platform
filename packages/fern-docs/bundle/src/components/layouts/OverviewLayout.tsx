import React from "react";

import { BuiltWithFern } from "@/components/built-with-fern";
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
    <div className="flex flex-1 flex-row-reverse gap-8 pl-8">
      <SetLayout value="overview" />
      <aside className="w-sidebar-width sticky top-[var(--header-height)] hidden h-fit max-h-[calc(100dvh-var(--header-height))] flex-col xl:flex">
        {toc}
      </aside>
      <article className="max-w-content-wide-width ml-0 mr-auto min-w-0 shrink xl:mx-auto">
        {header}
        <div className="prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full break-words">
          {children}
        </div>
        {footer}
        <BuiltWithFern className="mx-auto my-8 w-fit" />
      </article>
    </div>
  );
}
