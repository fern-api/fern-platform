import React from "react";

import { Prose } from "@/mdx/components/prose";
import { HideAsides, SetLayout } from "@/state/layout";

import { MobileMenuTrigger } from "../themes/default/dismissable-menu";

interface PageLayoutProps {
  header?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function PageLayout({ header, children, footer }: PageLayoutProps) {
  return (
    <article className="fern-layout-page">
      <div className="pointer-coarse:hidden top-(--header-height) fixed left-0 hidden p-3 md:block">
        <MobileMenuTrigger />
      </div>

      <SetLayout value="page" />
      <HideAsides force />
      {header}
      <Prose className="prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full">
        {children}
      </Prose>
      {footer}
    </article>
  );
}
