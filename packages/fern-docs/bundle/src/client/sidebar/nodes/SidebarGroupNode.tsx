"use client";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ReactNode } from "react";
import { SidebarNavigationChild } from "./SidebarNavigationChild";

interface SidebarGroupNodeProps {
  node: FernNavigation.SidebarGroupNode;
}

export function SidebarGroupNode({ node }: SidebarGroupNodeProps): ReactNode {
  return (
    <ul className="fern-sidebar-group">
      {node.children.map((child) => (
        <li key={child.id}>
          <SidebarNavigationChild node={child} depth={1} root />
        </li>
      ))}
    </ul>
  );
}
