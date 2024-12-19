import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { UnreachableCaseError } from "ts-essentials";
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
}: SidebarApiPackageChild): React.ReactElement {
  switch (node.type) {
    case "page":
      return <SidebarPageNode node={node} depth={depth} shallow={shallow} />;
    case "link":
      return <SidebarLinkNode node={node} depth={depth} />;
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
      return <SidebarApiPackageNode node={node} depth={depth} />;
    case "changelog":
      return <SidebarChangelogNode node={node} depth={depth} />;
    default:
      throw new UnreachableCaseError(node);
  }
}
