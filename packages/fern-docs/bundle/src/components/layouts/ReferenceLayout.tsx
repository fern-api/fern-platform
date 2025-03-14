"use client";

import React, { ComponentPropsWithoutRef } from "react";

import { cn } from "@fern-docs/components";
import { useIsMobile } from "@fern-ui/react-commons";

import { Prose } from "@/mdx/components/prose";
import { SetLayout } from "@/state/layout";

import { AsideAwareDiv } from "./AsideAwareDiv";

interface ReferenceLayoutProps {
  header?: React.ReactNode;
  aside?: React.ReactNode;
  children?: React.ReactNode;
  reference?: React.ReactNode;
  footer?: React.ReactNode;
  enableFullWidth?: boolean;
  /**
   * If true, scrolling will be disabled on the reference sidebar
   * so that the code examples are constrained and must implement
   * scrolling within themselves.
   */
  kind?: "api" | "guide";
}

export const ReferenceLayout = React.forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"article"> & ReferenceLayoutProps
>(function ReferenceLayout(
  {
    header,
    aside,
    children,
    footer,
    reference,
    enableFullWidth,
    kind = "api",
    ...props
  },
  ref
) {
  const isMobile = useIsMobile();
  return (
    <AsideAwareDiv className="fern-layout-reference">
      <SetLayout value="reference" />
      <article
        {...props}
        className={cn(
          "w-content-width md:w-endpoint-width max-w-full",
          { "xl:w-page-width": enableFullWidth },
          props.className
        )}
        ref={ref}
      >
        {header}
        <div className="fern-layout-reference-content">
          {!isMobile && (
            <aside className="fern-layout-reference-aside" data-kind={kind}>
              {kind === "api" ? (
                aside
              ) : (
                <Prose className="relative">{aside}</Prose>
              )}
            </aside>
          )}
          <Prose className="mb-12 space-y-12">
            {children}
            {isMobile && (
              <section className="fern-layout-reference-aside" data-kind={kind}>
                {aside}
              </section>
            )}
            {reference}
            {footer}
          </Prose>
        </div>
      </article>
    </AsideAwareDiv>
  );
});
