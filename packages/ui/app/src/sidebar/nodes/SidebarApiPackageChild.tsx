import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
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

export function SidebarApiPackageChild({ node, depth, shallow }: SidebarApiPackageChild): React.ReactElement {
    return visitDiscriminatedUnion(node)._visit({
        page: (node) => <SidebarPageNode node={node} depth={depth} shallow={shallow} />,
        link: (node) => <SidebarLinkNode node={node} depth={depth} />,
        endpoint: (node) => <SidebarApiLeafNode node={node} depth={depth} shallow={shallow} />,
        endpointPair: (node) => <SidebarEndpointPairNode node={node} depth={depth} shallow={shallow} />,
        webSocket: (node) => <SidebarApiLeafNode node={node} depth={depth} shallow={shallow} />,
        webhook: (node) => <SidebarApiLeafNode node={node} depth={depth} shallow={shallow} />,
        apiPackage: (node) => <SidebarApiPackageNode node={node} depth={depth} />,
        changelog: (node) => <SidebarChangelogNode node={node} depth={depth} />,
    });
}
