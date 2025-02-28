import { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";

import { cn } from "@fern-docs/components";

interface ChangelogContentLayoutProps extends ComponentPropsWithoutRef<"div"> {
  as: "div" | "section" | "article";
  stickyContent?: ReactNode;
  children: ReactNode;
}

export function ChangelogContentLayout({
  as: Component,
  children,
  stickyContent,
  ...props
}: ChangelogContentLayoutProps): ReactElement<any> {
  return (
    <Component
      {...props}
      className={cn(
        "max-w-content-wide-width relative mx-auto grid w-full grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(0,var(--content-width))_1fr]",
        props.className
      )}
    >
      <aside className="sticky top-[calc(var(--header-height)+var(--spacing)*4)] hidden h-fit lg:flex lg:justify-end">
        {stickyContent}
      </aside>
      <div className="max-w-content-width mx-auto w-full">
        {stickyContent != null && (
          <div className="mb-4 lg:hidden">{stickyContent}</div>
        )}
        {children}
      </div>
    </Component>
  );
}
