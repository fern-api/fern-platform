import type { ReactElement } from "react";

import { cn } from "@fern-docs/components";

import { Prose } from "../../mdx/components/prose";

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
      {toc}
      <div className="px-page-padding mx-auto mb-12 min-w-0 shrink space-y-8 lg:ml-0 xl:ml-auto">
        <article className="w-content-width max-w-full">
          {header}
          <Prose className="prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full">
            {children}
          </Prose>
          {footer}
        </article>
      </div>
    </>
  );
}
