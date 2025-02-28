import { ReactElement } from "react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { cn } from "@fern-docs/components";

import { SidebarPageNode } from "./SidebarPageNode";

interface SidebarRootHeadingProps {
  node: FernNavigation.NavigationNodeSection;
  icon: React.ReactNode;
  className: string | undefined;
  shallow?: boolean;
}

export function SidebarRootHeading({
  node,
  icon,
  className,
  shallow,
}: SidebarRootHeadingProps): ReactElement<any> {
  if (FernNavigation.hasMarkdown(node)) {
    return (
      <SidebarPageNode
        node={node}
        depth={0}
        className={cn(className, "!text-body font-semibold")}
        shallow={shallow}
        icon={icon}
      />
    );
  }

  return (
    <div className={cn("fern-sidebar-heading", className)}>
      {icon}
      <span className="fern-sidebar-heading-content">{node.title}</span>
    </div>
  );
}
