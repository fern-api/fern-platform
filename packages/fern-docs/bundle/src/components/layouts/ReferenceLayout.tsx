"use client";

import React, { ComponentPropsWithoutRef } from "react";

import { cn } from "@fern-docs/components";

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
  return (
    <div className="ml-0 mr-auto min-w-0 shrink px-8 xl:mx-auto">
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
        <div className="layout">
          <section>{children}</section>
          <aside>{aside}</aside>
          <section>
            {reference}
            {footer}
          </section>
        </div>
        <style jsx>
          {`
            article > .layout {
              margin: 3rem 0;
              gap: 3rem;
              display: grid;
              position: relative;
              grid-template-areas:
                "content"
                "aside"
                "footer";
            }

            article > .layout > section:first-child {
              grid-area: content;
            }

            article > .layout > aside {
              grid-area: aside;
              display: flex;
            }

            article > .layout > section:last-child {
              grid-area: footer;
              grid-row-end: none;
            }

            article > .layout > section:empty {
              display: none;
            }

            article > .layout:has(> section:first-child:empty) {
              grid-template-areas: "aside" "footer";
            }

            @media (min-width: 768px) {
              article > .layout {
                margin: 1.5rem 0;
                gap: 2rem;
                grid-template-columns: 1fr 1fr;
                grid-template-areas:
                  "content aside"
                  "footer aside";
                grid-template-rows: fit-content(100%) fit-content(100%);
              }

              article > .layout:has(> section:first-child:empty) {
                grid-template-areas: "footer aside";
              }

              article > .layout > aside {
                max-height: calc(100vh - var(--header-height) - 3rem);
                height: fit-content;
                position: sticky;
                top: calc(var(--header-height) + 1.5rem);
              }
            }

            @media (min-width: 1024px) {
              article > .layout {
                gap: 3rem;
              }
            }
          `}
        </style>
      </article>
    </div>
  );
});
