import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { OpenNewWindow } from "iconoir-react";
import { useAtomValue } from "jotai";
import { LOCATION_ATOM } from "../../atoms";
import { SidebarLink } from "../SidebarLink";

interface SidebarLinkNodeProps {
    node: FernNavigation.LinkNode;
    depth: number;
    className?: string;
}

export function SidebarLinkNode({ node, depth, className }: SidebarLinkNodeProps): React.ReactElement {
    const { pathname, hash } = useAtomValue(LOCATION_ATOM);
    const isSelected = `${pathname}${hash}` === node.url;

    return (
        <SidebarLink
            selected={isSelected}
            icon={node.icon}
            nodeId={node.id}
            className={className}
            depth={Math.max(depth - 1, 0)}
            title={node.title}
            rightElement={<OpenNewWindow className="size-4 self-center text-faded" />}
            href={node.url}
        />
    );
}
