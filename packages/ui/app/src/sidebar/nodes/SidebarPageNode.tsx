import { FernNavigation } from "@fern-api/fdr-sdk";
import { useCurrentNodeId } from "../../atoms";
import { SidebarSlugLink } from "../SidebarLink";

interface SidebarPageNodeProps {
    node: FernNavigation.PageNode;
    depth: number;
    className?: string;
}

export function SidebarPageNode({ node, depth, className }: SidebarPageNodeProps): React.ReactElement | null {
    const selectedNodeId = useCurrentNodeId();

    if (node.hidden && selectedNodeId === node.id) {
        return null;
    }

    return (
        <SidebarSlugLink
            nodeId={node.id}
            className={className}
            slug={node.slug}
            depth={Math.max(depth - 1, 0)}
            title={node.title}
            selected={node.id === selectedNodeId}
            icon={node.icon}
            hidden={node.hidden}
            shallow={selectedNodeId === node.id}
            scrollOnShallow={false}
        />
    );
}
