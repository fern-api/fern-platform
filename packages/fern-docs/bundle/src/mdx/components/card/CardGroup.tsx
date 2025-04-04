import React from "react";

import { cn } from "@fern-docs/components";

export function CardGroup({
  children,
  cols,
}: React.PropsWithChildren<{
  cols?: number;
}>) {
  if (!cols) {
    cols = Math.min(React.Children.count(children), 2);
  }

  return (
    <div
      className={cn("my-6 grid gap-4 first:mt-0 sm:gap-6", {
        "grid-cols-1": cols <= 1,
        "grid-cols-1 sm:grid-cols-2": cols === 2,
        "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3": cols === 3,
        "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4": cols === 4,
        "grid-cols-1 sm:grid-cols-2 xl:grid-cols-5": cols === 5,
        "grid-cols-1 sm:grid-cols-2 xl:grid-cols-6": cols >= 6,
      })}
    >
      {children}
    </div>
  );
}
