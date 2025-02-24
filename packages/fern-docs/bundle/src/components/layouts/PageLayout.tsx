import React from "react";

import { Prose } from "../mdx/prose";

interface PageLayoutProps {
  header?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function PageLayout({ header, children, footer }: PageLayoutProps) {
  return (
    <article className="max-w-page-width px-page-padding mx-auto min-w-0 flex-1">
      {header}
      <Prose className="prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full">
        {children}
      </Prose>
      {footer}
    </article>
  );
}
