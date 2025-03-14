import { Prose } from "@/mdx/components/prose";
import { SetLayout } from "@/state/layout";

import { AsideAwareDiv } from "./AsideAwareDiv";

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
}: GuideLayoutProps) {
  return (
    <>
      <SetLayout value="guide" />
      {toc}
      <AsideAwareDiv className="fern-layout-guide">
        <article className="w-content-width max-w-full">
          {header}
          <Prose className="prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full">
            {children}
          </Prose>
          {footer}
        </article>
      </AsideAwareDiv>
    </>
  );
}
