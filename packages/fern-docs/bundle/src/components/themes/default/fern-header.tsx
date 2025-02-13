"use client";

import React from "react";

import { DEFAULT_HEADER_HEIGHT } from "@fern-docs/utils";

import { useTabs } from "@/state/navigation";

export function FernHeader({
  defaultHeight,
  ...props
}: React.ComponentPropsWithoutRef<"header"> & {
  defaultHeight?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const tabs = useTabs();
  const tabsHeight = tabs?.length ? 44 : 0;

  const [headerHeight, setHeaderHeight] = React.useState<number>(
    () => (defaultHeight ?? DEFAULT_HEADER_HEIGHT) + tabsHeight
  );
  React.useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const headerHeight = entries[0]?.contentRect.height;
      if (headerHeight) {
        setHeaderHeight(headerHeight);
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
          :global(:root) {
            --header-height: ${headerHeight}px;
          }

          :global(html, body) {
            scroll-padding-top: var(--header-height);
          }
        `}
      </style>
      {props.children}
    </header>
  );
}
