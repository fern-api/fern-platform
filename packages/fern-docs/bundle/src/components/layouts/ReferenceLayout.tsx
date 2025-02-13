"use client";

import React, { ComponentPropsWithoutRef } from "react";

import { cn } from "@fern-docs/components";

import { BuiltWithFern } from "@/components/built-with-fern";
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
    <div className="px-4 md:px-6 lg:px-8">
      <SetLayout value="reference" />
      <article
        {...props}
        className={cn(
          "max-w-content-width md:max-w-endpoint-width mx-auto w-full lg:ml-0 xl:mx-auto",
          props.className
        )}
        ref={ref}
      >
        {header}
        <div className="layout">
          <section>{children}</section>
          <aside>{aside}</aside>
          <section>
            {reference}
            {footer}
          </section>
        </div>
        <BuiltWithFern className="mx-auto my-8 w-fit" />
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
            }

            article > .layout > section:empty {
              display: none;
            }

            article > .layout:has(> section:first-child:empty) {
              grid-template-areas: "aside" "footer";
            }

            @media (min-width: 768px) {
              article > .layout {
                margin: 2rem 0;
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
                margin: 3rem 0;
                gap: 3rem;
              }
            }
          `}
        </style>
      </article>
    </div>
  );
});
