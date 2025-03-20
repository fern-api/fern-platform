"use client";

import { useServerInsertedHTML } from "next/navigation";
import React from "react";

import { FERN_HEADER_ID } from "@/components/constants";

export function FernHeader(props: React.ComponentPropsWithoutRef<"header">) {
  const ref = React.useRef<HTMLDivElement>(null);

  const inserted = React.useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;

    // TODO: this needs to be re-run if the announcement banner is removed.
    return (
      <script
        key="fern-header-height"
        type="text/javascript"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `(${String(function () {
            (window.requestAnimationFrame ?? window.setTimeout)(() => {
              const headerHeight =
                document.getElementById("fern-header")?.clientHeight ?? 0;
              document.documentElement.style.setProperty(
                "--header-height",
                `${String(headerHeight)}px`
              );
            });
          })})()`,
        }}
      />
    );
  });

  React.useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry == null) return;
      const headerHeight = entry.contentRect.height;
      document.documentElement.style.setProperty(
        "--header-height",
        `${headerHeight}px`
      );
    });

    resizeObserver.observe(ref.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <header ref={ref} id={FERN_HEADER_ID} role="banner" {...props}>
      <style jsx global key="__fern-header-scroll-padding">
        {`
          html,
          body {
            scroll-padding-top: calc(
              var(--header-height) + (var(--spacing) * 4)
            );
          }
        `}
      </style>
      {props.children}
    </header>
  );
}
