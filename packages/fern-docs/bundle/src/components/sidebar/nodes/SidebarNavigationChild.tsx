import "server-only";

import { ReactNode } from "react";

import { UnreachableCaseError } from "ts-essentials";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { cn } from "@fern-docs/components";

import { FaIconServer } from "@/components/fa-icon-server";

import { SidebarApiPackageChild } from "./SidebarApiPackageChild";
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
      return (
        <SidebarApiPackageNode
          node={node}
          depth={depth}
          icon={node.icon ? <FaIconServer icon={node.icon} /> : undefined}
        >
          {node.children.map((node: FernNavigation.ApiPackageChild) => (
            <SidebarApiPackageChild
              key={node.id}
              node={node}
              depth={depth + 1}
              shallow={false}
            />
          ))}
        </SidebarApiPackageNode>
      );
    case "section":
      return (
        <SidebarSectionNode
          node={node}
          icon={node.icon ? <FaIconServer icon={node.icon} /> : undefined}
          depth={depth}
          className={cn({
            "!text-body font-semibold": root,
          })}
        >
          {node.children.map((node: FernNavigation.NavigationChild) => (
            <SidebarNavigationChild
              key={node.id}
              node={node}
              depth={depth + 1}
            />
          ))}
        </SidebarSectionNode>
      );
    case "page":
      return (
        <SidebarPageNode
          node={node}
          depth={depth}
          icon={node.icon ? <FaIconServer icon={node.icon} /> : undefined}
        />
      );
    case "link":
      return (
        <SidebarLinkNode
          node={node}
          depth={depth}
          icon={node.icon ? <FaIconServer icon={node.icon} /> : undefined}
        />
      );
    case "changelog":
      return (
        <SidebarChangelogNode
          node={node}
          depth={depth}
          icon={node.icon ? <FaIconServer icon={node.icon} /> : undefined}
        />
      );
    default:
      throw new UnreachableCaseError(node);
  }
}
