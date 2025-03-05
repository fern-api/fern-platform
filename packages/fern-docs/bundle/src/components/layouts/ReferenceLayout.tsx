"use client";

import React, { ComponentPropsWithoutRef } from "react";

import { cn } from "@fern-docs/components";
import { tunnel, useIsMobile, useLazyRef } from "@fern-ui/react-commons";

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
    <AsideAwareDiv className="pl-page-padding mx-auto min-w-0 shrink pr-[calc(var(--page-padding)+var(--aside-offset))]">
      <SetLayout value="reference" />
      <slot.In>
        <aside className="order-last flex max-h-[calc(100svh-var(--header-height)-6rem)] shrink-0 md:flex-col md:sticky md:top-[calc(var(--header-height)+1.5rem)] md:h-fit md:max-h-[calc(100vh-var(--header-height)-3rem)]">
          {aside}
        </aside>
      </slot.In>
      <article
        {...props}
        className={cn(
          "w-content-width md:w-endpoint-width max-w-full",
          {
            "xl:w-page-width": enableFullWidth,
          },
          props.className
        )}
        ref={ref}
      >
        {header}
        <div className="my-6 md:grid md:grid-cols-2 md:gap-8 lg:gap-12">
          {!isMobile && <slot.Out />}
          <div className="mb-12 space-y-12">
            {children}
            {isMobile && <slot.Out />}
            {reference}
            {footer}
          </div>
        </div>
      </article>
    </AsideAwareDiv>
  );
});
