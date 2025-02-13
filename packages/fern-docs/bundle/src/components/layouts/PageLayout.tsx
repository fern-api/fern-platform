import React from "react";

import { BuiltWithFern } from "@/components/built-with-fern";
import { SetLayout } from "@/state/layout";

interface PageLayoutProps {
  header?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function PageLayout({ header, children, footer }: PageLayoutProps) {
  return (
    <article className="max-w-page-width mx-auto flex-1">
      <SetLayout value="page" />
      {header}
      <div className="prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full break-words">
        {children}
      </div>
      {footer}
      <BuiltWithFern className="mx-auto my-8 w-fit" />
    </article>
  );
}
