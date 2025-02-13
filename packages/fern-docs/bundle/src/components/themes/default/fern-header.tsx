"use client";

import { useServerInsertedHTML } from "next/navigation";
import React from "react";

export function FernHeader({
  defaultHeight,
  ...props
}: React.ComponentPropsWithoutRef<"header"> & {
  defaultHeight?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  const inserted = React.useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return (
      <script
        key="fern-header-height"
        type="text/javascript"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `(${String(function () {
            window.requestAnimationFrame(() => {
              const header = document.getElementById("fern-header");
              if (header == null) {
                return;
              }

              const resizeObserver = new window.ResizeObserver((entries) => {
                const headerHeight = entries[0]?.contentRect.height;
                if (headerHeight) {
                  document.documentElement.style.setProperty(
                    "--header-height",
                    `${headerHeight}px`
                  );
                }
              });

              resizeObserver.observe(header);
            });
          })})()`,
        }}
      />
    );
  });

  return (
    <header ref={ref} id="fern-header" role="banner" {...props}>
      <style jsx>
        {`
          :global(html, body) {
            scroll-padding-top: var(--header-height);
          }
        `}
      </style>
      {props.children}
    </header>
  );
}
