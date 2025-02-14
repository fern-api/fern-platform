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
  const asideContent = stickyContent != null && (
    <div className="fern-changelog-date">{stickyContent}</div>
  );
  return (
    <Component
      {...props}
      className={cn("fern-changelog-entry", props.className)}
    >
      <aside>{asideContent}</aside>
      <div className="fern-changelog-content">
        {asideContent}
        {children}
      </div>
    </Component>
  );
}
