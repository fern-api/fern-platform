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
        "w-content-wide-width relative mx-auto grid grid-cols-[1fr_minmax(0,var(--content-width))_1fr]",
        props.className
      )}
    >
      <aside className="sticky top-[calc(var(--header-height)+var(--spacing)*4)] hidden h-fit md:block">
        {stickyContent}
      </aside>
      <div className="w-content-width">
        {stickyContent != null && (
          <div className="md:hidden">{stickyContent}</div>
        )}
        {children}
      </div>
    </Component>
  );
}
