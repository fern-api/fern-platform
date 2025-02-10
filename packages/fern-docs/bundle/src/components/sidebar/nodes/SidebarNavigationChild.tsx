import { ReactNode } from "react";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import clsx from "clsx";
import { UnreachableCaseError } from "ts-essentials";

import { SidebarApiPackageNode } from "./SidebarApiPackageNode";
import { SidebarChangelogNode } from "./SidebarChangelogNode";
import { SidebarLinkNode } from "./SidebarLinkNode";
import { SidebarPageNode } from "./SidebarPageNode";
import { SidebarSectionNode } from "./SidebarSectionNode";

interface SidebarNavigationChildProps {
  node: FernNavigation.NavigationChild;
  depth: number;
  root?: boolean;
}

export function SidebarNavigationChild({
  node,
  depth,
  root,
}: SidebarNavigationChildProps): ReactNode {
  switch (node.type) {
    case "apiReference":
      return <SidebarApiPackageNode node={node} depth={depth} />;
    case "section":
      return (
        <SidebarSectionNode
          node={node}
          depth={depth}
          className={clsx({
            "!text-text-default font-semibold": root,
          })}
        />
      );
    case "page":
      return <SidebarPageNode node={node} depth={depth} />;
    case "link":
      return <SidebarLinkNode node={node} depth={depth} />;
    case "changelog":
      return <SidebarChangelogNode node={node} depth={depth} />;
    default:
      throw new UnreachableCaseError(node);
  }
}
