"use client";

import { cn } from "@fern-docs/components";
import React from "react";

export default function FernHeader({
  children,
  initialHeight,
}: {
  children: React.ReactNode;
  initialHeight?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = React.useState<number>(
    initialHeight ?? 44
  );

  React.useEffect(() => {
    if (ref.current) {
      const resizeObserver = new ResizeObserver(([entry]) => {
        if (entry) {
          setHeaderHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(ref.current);
      return () => resizeObserver.disconnect();
    }
    return;
  }, [ref]);

  return (
    <header
      ref={ref}
      id="fern-header"
      role="banner"
      className={cn(
        "fixed inset-x-0 top-0 z-30",
        // https://github.com/theKashey/react-remove-scroll-bar/blob/master/src/constants.ts#L2
        "width-before-scroll-bar"
      )}
    >
      <style jsx>{`
        :global(:root) {
          --header-height: ${headerHeight}px;
        }
      `}</style>
      {children}
    </header>
  );
}
