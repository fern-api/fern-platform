import "server-only";

import { UnreachableCaseError } from "ts-essentials";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { FaIconServer } from "@/components/fa-icon-server";

import { SidebarGroupNode } from "./SidebarGroupNode";
import { SidebarRootApiPackageNode } from "./SidebarRootApiPackageNode";
import { SidebarRootSectionNode } from "./SidebarRootSectionNode";

export function SidebarRootChild({
  node,
}: {
  node: FernNavigation.SidebarRootChild | FernNavigation.ApiPackageNode;
}) {
  switch (node.type) {
    case "sidebarGroup":
      return <SidebarGroupNode node={node} />;
    case "apiReference":
    case "apiPackage":
      return (
        <SidebarRootApiPackageNode
          node={node}
          icon={node.icon ? <FaIconServer icon={node.icon} /> : undefined}
        />
      );
    case "section":
      return (
        <SidebarRootSectionNode
          node={node}
          icon={node.icon ? <FaIconServer icon={node.icon} /> : undefined}
        />
      );
    default:
      throw new UnreachableCaseError(node);
  }
}
