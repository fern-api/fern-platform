import { PropsWithChildren, ReactElement } from "react";

import { cn } from "@fern-docs/components";

export function PlaygroundCardSkeleton({
  className,
  children,
}: PropsWithChildren<{ className?: string }>): ReactElement<any> {
  return (
    <div className={cn("bg-(color:--grayscale-a3) rounded-3", className)}>
      {children && <div className="invisible contents">{children}</div>}
    </div>
  );
}
