import { PropsWithChildren, ReactElement } from "react";

import clsx from "clsx";

export function PlaygroundCardSkeleton({
  className,
  children,
}: PropsWithChildren<{ className?: string }>): ReactElement<any> {
  return (
    <div className={clsx("bg-tag-default rounded-xl", className)}>
      {children && <div className="invisible contents">{children}</div>}
    </div>
  );
}
