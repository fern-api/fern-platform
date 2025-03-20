import "server-only";

import { ReactNode } from "react";

import { UnreachableCaseError } from "ts-essentials";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { FaIconServer } from "@/components/fa-icon-server";

import { SidebarApiLeafNode } from "./SidebarApiLeafNode";
import { SidebarApiPackageNode } from "./SidebarApiPackageNode";
import { SidebarChangelogNode } from "./SidebarChangelogNode";
import { SidebarEndpointPairNode } from "./SidebarEndpointPairNode";
import { SidebarLinkNode } from "./SidebarLinkNode";
import { SidebarPageNode } from "./SidebarPageNode";

interface SidebarApiPackageChild {
  node: FernNavigation.ApiPackageChild | FernNavigation.ChangelogNode;
  depth: number;
  shallow: boolean;
}

export function SidebarApiPackageChild({
  node,
  depth,
  shallow,
}: SidebarApiPackageChild): ReactNode {
  switch (node.type) {
    case "page":
      return (
        <SidebarPageNode
          icon={node.icon ? <FaIconServer icon={node.icon} /> : undefined}
          node={node}
          depth={depth}
          shallow={shallow}
        />
      );
    case "link":
      return (
        <SidebarLinkNode
          icon={node.icon ? <FaIconServer icon={node.icon} /> : undefined}
          node={node}
          depth={depth}
        />
      );
    case "endpoint":
      return <SidebarApiLeafNode node={node} depth={depth} shallow={shallow} />;
    case "endpointPair":
      return (
        <SidebarEndpointPairNode node={node} depth={depth} shallow={shallow} />
      );
    case "webSocket":
      return <SidebarApiLeafNode node={node} depth={depth} shallow={shallow} />;
    case "webhook":
      return <SidebarApiLeafNode node={node} depth={depth} shallow={shallow} />;
    case "apiPackage":
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
              shallow={shallow}
            />
          ))}
        </SidebarApiPackageNode>
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
