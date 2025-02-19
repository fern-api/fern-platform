import React from "react";

import { cn } from "@fern-docs/components";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn("bg-grayscale-a3 animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
