import clsx from "clsx";
import { PropsWithChildren, ReactElement } from "react";

export function ExplorerCardSkeleton({
  className,
  children,
}: PropsWithChildren<{ className?: string }>): ReactElement {
  return (
    <div className={clsx("bg-tag-default rounded-xl", className)}>
      {children && <div className="invisible contents">{children}</div>}
    </div>
  );
}
