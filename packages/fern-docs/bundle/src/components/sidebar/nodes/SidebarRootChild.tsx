import { ReactElement } from "react";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { UnreachableCaseError } from "ts-essentials";

import { SidebarGroupNode } from "./SidebarGroupNode";
import { SidebarRootApiPackageNode } from "./SidebarRootApiPackageNode";
import { SidebarRootSectionNode } from "./SidebarRootSectionNode";

export interface SidebarRootChildProps {
  node: FernNavigation.SidebarRootChild | FernNavigation.ApiPackageNode;
}

export function SidebarRootChild({
  node,
}: SidebarRootChildProps): ReactElement<any> {
  switch (node.type) {
    case "sidebarGroup":
      return <SidebarGroupNode node={node} />;
    case "apiReference":
    case "apiPackage":
      return <SidebarRootApiPackageNode node={node} />;
    case "section":
      return <SidebarRootSectionNode node={node} />;
    default:
      throw new UnreachableCaseError(node);
  }
}
