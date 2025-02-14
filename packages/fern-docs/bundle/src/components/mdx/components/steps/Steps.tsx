import { ComponentProps, ReactElement } from "react";

import { cn } from "@fern-docs/components";

export function StepGroup({
  children,
  className,
  ...props
}: ComponentProps<"div">): ReactElement<any> {
  return (
    <div className={cn("fern-steps", className)} {...props}>
      {children}
    </div>
  );
}
