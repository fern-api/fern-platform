import React from "react";

import { cn } from "./cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--grayscale-a3)]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
