import { FernNavigation } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarApiLeafNode } from "./SidebarApiLeafNode";
import { SidebarApiSectionNode } from "./SidebarApiSectionNode";
import { SidebarEndpointPairNode } from "./SidebarEndpointPairNode";
import { SidebarLinkNode } from "./SidebarLinkNode";
import { SidebarPageNode } from "./SidebarPageNode";

interface SidebarApiSectionChild {
    node: FernNavigation.ApiSectionChild;
    depth: number;
}

export function SidebarApiSectionChild({ node, depth }: SidebarApiSectionChild): React.ReactElement {
    return visitDiscriminatedUnion(node)._visit({
        page: (node) => <SidebarPageNode node={node} depth={depth} />,
        link: (node) => <SidebarLinkNode node={node} depth={depth} />,
        endpoint: (node) => <SidebarApiLeafNode node={node} depth={depth} />,
        endpointPair: (node) => <SidebarEndpointPairNode node={node} depth={depth} />,
        webSocket: (node) => <SidebarApiLeafNode node={node} depth={depth} />,
        webhook: (node) => <SidebarApiLeafNode node={node} depth={depth} />,
        apiSection: (node) => <SidebarApiSectionNode node={node} depth={depth} />,
    });
}
