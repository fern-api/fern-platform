import { FernNavigation } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarApiLeafNode } from "./SidebarApiLeafNode";
import { SidebarApiPackageNode } from "./SidebarApiPackageNode";
import { SidebarChangelogNode } from "./SidebarChangelogNode";
import { SidebarEndpointPairNode } from "./SidebarEndpointPairNode";
import { SidebarLinkNode } from "./SidebarLinkNode";
import { SidebarPageNode } from "./SidebarPageNode";

interface SidebarApiPackageChild {
    node: FernNavigation.ApiPackageChild | FernNavigation.ChangelogNode;
    depth: number;
}

export function SidebarApiPackageChild({ node, depth }: SidebarApiPackageChild): React.ReactElement {
    return visitDiscriminatedUnion(node)._visit({
        page: (node) => <SidebarPageNode node={node} depth={depth} />,
        link: (node) => <SidebarLinkNode node={node} depth={depth} />,
        endpoint: (node) => <SidebarApiLeafNode node={node} depth={depth} />,
        endpointPair: (node) => <SidebarEndpointPairNode node={node} depth={depth} />,
        webSocket: (node) => <SidebarApiLeafNode node={node} depth={depth} />,
        webhook: (node) => <SidebarApiLeafNode node={node} depth={depth} />,
        apiPackage: (node) => <SidebarApiPackageNode node={node} depth={depth} />,
        changelog: (node) => <SidebarChangelogNode node={node} depth={depth} />,
    });
}
