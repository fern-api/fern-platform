import React from "react";

import { cn } from "@fern-docs/components";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-(--grayscale-a3)", className)}
      {...props}
    />
  );
}

export { Skeleton };
