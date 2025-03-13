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
      className={cn("fern-changelog-content", props.className)}
    >
      <aside>{stickyContent}</aside>
      <div className="max-w-content-width mx-auto w-full">
        {stickyContent != null && (
          <div className="eyebrow">{stickyContent}</div>
        )}
        {children}
      </div>
    </Component>
  );
}
