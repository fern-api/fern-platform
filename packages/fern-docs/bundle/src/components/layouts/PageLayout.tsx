import React from "react";

interface PageLayoutProps {
  header?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function PageLayout({ header, children, footer }: PageLayoutProps) {
  return (
    <article className="max-w-page-width px-page-padding mx-auto flex-1">
      {header}
      <div className="prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full break-words">
        {children}
      </div>
      {footer}
    </article>
  );
}
