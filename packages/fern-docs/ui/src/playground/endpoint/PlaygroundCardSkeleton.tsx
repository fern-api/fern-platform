import clsx from "clsx";
import { PropsWithChildren, ReactElement } from "react";

export function PlaygroundCardSkeleton({
  className,
  children,
}: PropsWithChildren<{ className?: string }>): ReactElement {
  return (
    <div className={clsx("rounded-xl bg-tag-default", className)}>
      {children && <div className="invisible contents">{children}</div>}
    </div>
  );
}
