import { FernNavigation } from "@fern-api/fdr-sdk";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { SidebarLink } from "../SidebarLink";

interface SidebarLinkNodeProps {
    node: FernNavigation.LinkNode;
    depth: number;
    className?: string;
}

export function SidebarLinkNode({ node, depth, className }: SidebarLinkNodeProps): React.ReactElement {
    return (
        <SidebarLink
            nodeId={node.id}
            className={className}
            depth={Math.max(depth - 1, 0)}
            title={node.title}
            rightElement={node.url.startsWith("http") && <ExternalLinkIcon />}
            href={node.url}
            hidden={false}
        />
    );
}
