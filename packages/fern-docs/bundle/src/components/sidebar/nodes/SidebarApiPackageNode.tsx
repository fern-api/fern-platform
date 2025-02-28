import "server-only";

import React, { ReactNode } from "react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { SidebarCollapseGroup } from "./SidebarCollapseGroup";
import { SidebarGroupApiReferenceNode } from "./SidebarGroupApiReferenceNode";
import { SidebarPageNode } from "./SidebarPageNode";

export interface SidebarApiPackageNodeProps {
  node: FernNavigation.ApiReferenceNode | FernNavigation.ApiPackageNode;
  icon: React.ReactNode;
  depth: number;
  className?: string;
  children: ReactNode;
}

export function SidebarApiPackageNode({
  node,
  icon,
  depth,
  className,
  children,
}: SidebarApiPackageNodeProps): ReactNode {
  if (
    React.Children.count(children) === 0 &&
    FernNavigation.hasMarkdown(node)
  ) {
    return (
      <SidebarPageNode
        node={node}
        depth={depth}
        className={className}
        shallow={false}
        icon={icon}
      />
    );
  }

  if (React.Children.count(children) === 0) {
    return null;
  }

  if (node.type === "apiReference" && node.hideTitle) {
    return <SidebarGroupApiReferenceNode node={node} depth={depth} />;
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
