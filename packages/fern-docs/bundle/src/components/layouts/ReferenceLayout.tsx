"use client";

import React, { ComponentPropsWithoutRef } from "react";

import { cn } from "@fern-docs/components";
import { tunnel, useIsMobile, useLazyRef } from "@fern-ui/react-commons";

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
}

export const ReferenceLayout = React.forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"article"> & ReferenceLayoutProps
>(function ReferenceLayout(
  { header, aside, children, footer, reference, enableFullWidth, ...props },
  ref
) {
  const slot = useLazyRef(() => tunnel()).current;
  const isMobile = useIsMobile();
  return (
    <AsideAwareDiv className="fern-layout-reference">
      <SetLayout value="reference" />
      <slot.In>
        <aside className="fern-layout-reference-aside">{aside}</aside>
      </slot.In>
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
          {!isMobile && <slot.Out />}
          <div className="mb-12 space-y-12">
            {children && (
              <Prose className="prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full">
                {children}
              </Prose>
            )}
            {isMobile && <slot.Out />}
            {reference}
            {footer}
          </div>
        </div>
      </article>
    </AsideAwareDiv>
  );
});
