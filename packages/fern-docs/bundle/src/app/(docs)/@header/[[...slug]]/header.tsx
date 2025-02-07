"use client";

import { cn } from "@fern-docs/components";
import { DEFAULT_HEADER_HEIGHT } from "@fern-docs/utils";
import React from "react";

export function Header({
  children,
  initialHeight,
}: {
  children: React.ReactNode;
  initialHeight?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = React.useState<number>(
    initialHeight ?? DEFAULT_HEADER_HEIGHT
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
        "bg-[var(--header-background)]",
        "fixed inset-x-0 top-0 z-30",
        "backdrop-blur-xl",
        "border-concealed border-b",
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

export function HeaderNavLayout({
  left,
  center,
  right,
  height,
}: {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  height: number;
}) {
  return (
    <nav
      className="flex h-full shrink-0 items-center justify-between gap-4 px-4 md:px-6 lg:px-8"
      style={{ height }}
    >
      <div className="relative flex h-full min-w-fit flex-1 shrink-0 items-center gap-2 py-1">
        {left}
      </div>
      {center && (
        <div className="max-w-content-width mx-2 w-full min-w-0 shrink max-lg:hidden">
          {center}
        </div>
      )}
      <div className="-mr-1 flex flex-1 items-center justify-end space-x-0 md:mr-0 lg:space-x-4">
        {right}
      </div>
    </nav>
  );
}
