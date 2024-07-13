import { FERN_STREAM_ATOM } from "@/atoms";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { useAtomValue } from "jotai";
import { SidebarApiLeafNode } from "./SidebarApiLeafNode";

interface SidebarEndpointPairNodeProps {
    node: FernNavigation.EndpointPairNode;
    depth: number;
}

export function SidebarEndpointPairNode({ node, depth }: SidebarEndpointPairNodeProps): React.ReactElement | null {
    const isStream = useAtomValue(FERN_STREAM_ATOM);

    return isStream ? (
        <SidebarApiLeafNode node={node.stream} depth={depth} />
    ) : (
        <SidebarApiLeafNode node={node.nonStream} depth={depth} />
    );
}
