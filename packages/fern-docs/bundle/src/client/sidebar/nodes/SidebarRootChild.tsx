"use server";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { UnreachableCaseError } from "ts-essentials";
import { SidebarGroupNode } from "./SidebarGroupNode";
import { SidebarRootApiPackageNode } from "./SidebarRootApiPackageNode";
import { SidebarRootSectionNode } from "./SidebarRootSectionNode";

export default async function SidebarRootChild({
  node,
}: {
  node: FernNavigation.SidebarRootChild | FernNavigation.ApiPackageNode;
}) {
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
