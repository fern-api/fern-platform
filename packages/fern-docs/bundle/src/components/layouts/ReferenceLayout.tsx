"use client";

import React, { ComponentPropsWithoutRef } from "react";

import { cn } from "@fern-docs/components";
import { tunnel, useIsMobile, useLazyRef } from "@fern-ui/react-commons";

import { SetLayout } from "@/state/layout";

interface ReferenceLayoutProps {
  header: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
  reference?: React.ReactNode;
  footer?: React.ReactNode;
}

export const ReferenceLayout = React.forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"article"> & ReferenceLayoutProps
>(function ReferenceLayout(
  { header, aside, children, footer, reference, ...props },
  ref
) {
  const isMobile = useIsMobile();
  const slot = useLazyRef(() => tunnel()).current;
  return (
    <div className="mx-auto min-w-0 shrink px-4 md:px-6 lg:ml-0 lg:px-8 xl:ml-auto">
      <slot.In only>
        <aside className="order-last flex max-h-[calc(100svh-var(--header-height)-3rem)] md:sticky md:top-[calc(var(--header-height)+1.5rem)] md:h-fit md:max-h-[calc(100vh-var(--header-height)-3rem)]">
          {aside}
        </aside>
      </slot.In>
      <article
        {...props}
        className={cn(
          "w-content-width md:w-endpoint-width max-w-full",
          props.className
        )}
        ref={ref}
      >
        <SetLayout value="reference" />
        {header}
        <div className="mt-12 md:grid md:grid-cols-[1fr_1fr] md:gap-8 lg:gap-12">
          {!isMobile && <slot.Out />}
          <div className="mb-12 space-y-12">
            {children}
            {isMobile && <slot.Out />}
            {reference}
            {footer}
          </div>
        </div>
      </article>
    </div>
  );
});
