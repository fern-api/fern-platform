import { ReactNode } from "react";
import React from "react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { SidebarCollapseGroup } from "./SidebarCollapseGroup";
import { SidebarPageNode } from "./SidebarPageNode";

interface SidebarSectionNodeProps {
  node: FernNavigation.SectionNode;
  icon: React.ReactNode;
  depth: number;
  className?: string;
  children: ReactNode;
}

export function SidebarSectionNode({
  node,
  icon,
  className,
  depth,
  children,
}: SidebarSectionNodeProps): ReactNode {
  if (
    React.Children.count(children) === 0 &&
    FernNavigation.hasMarkdown(node)
  ) {
    return (
      <SidebarPageNode
        node={node}
        depth={depth}
        className={className}
        icon={icon}
      />
    );
  }

  if (React.Children.count(children) === 0) {
    return null;
  }

  return (
    <SidebarCollapseGroup
      node={node}
      icon={icon}
      depth={depth}
      className={className}
    >
      {children}
    </SidebarCollapseGroup>
  );
}
