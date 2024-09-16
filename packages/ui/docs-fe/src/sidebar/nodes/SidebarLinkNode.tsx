import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { OpenNewWindow } from "iconoir-react";
import { SidebarLink } from "../SidebarLink";

interface SidebarLinkNodeProps {
    node: FernNavigation.LinkNode;
    depth: number;
    className?: string;
}

export function SidebarLinkNode({ node, depth, className }: SidebarLinkNodeProps): React.ReactElement {
    return (
        <SidebarLink
            icon={node.icon}
            nodeId={node.id}
            className={className}
            depth={Math.max(depth - 1, 0)}
            title={node.title}
            rightElement={node.url.startsWith("http") && <OpenNewWindow className="text-faded size-4 self-center" />}
            href={node.url}
        />
    );
}
