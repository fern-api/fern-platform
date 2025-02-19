"use client";

import { useServerInsertedHTML } from "next/navigation";
import React from "react";

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
            document.addEventListener("DOMContentLoaded", function () {
              const headerHeight =
                document.getElementById("fern-header")?.clientHeight;
              if (headerHeight != null) {
                document.documentElement.style.setProperty(
                  "--header-height",
                  `${String(headerHeight)}px`
                );
              }
            });
          })})()`,
        }}
      />
    );
  });

  React.useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const headerHeight = entries[0]?.contentRect.height;
      if (headerHeight) {
        document.documentElement.style.setProperty(
          "--header-height",
          `${headerHeight}px`
        );
      }
    });

    resizeObserver.observe(ref.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
