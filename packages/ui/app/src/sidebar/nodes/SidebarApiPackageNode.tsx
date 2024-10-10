import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useCallback } from "react";
import {
    useIsApiReferenceShallowLink,
    useIsChildSelected,
    useIsExpandedSidebarNode,
    useIsSelectedSidebarNode,
    useToggleExpandedSidebarNode,
} from "../../atoms";
import { CollapsibleSidebarGroup } from "../CollapsibleSidebarGroup";
import { SidebarSlugLink } from "../SidebarLink";
import { SidebarApiPackageChild } from "./SidebarApiPackageChild";

export interface SidebarApiPackageNodeProps {
    node: FernNavigation.ApiReferenceNode | FernNavigation.ApiPackageNode;
    depth: number;
    className?: string;
}

export function SidebarApiPackageNode({
    node,
    depth,
    className,
}: SidebarApiPackageNodeProps): React.ReactElement | null {
    const selected = useIsSelectedSidebarNode(node.id);
    const handleToggleExpand = useToggleExpandedSidebarNode(node.id);
    const childSelected = useIsChildSelected(node.id);
    const expanded = useIsExpandedSidebarNode(node.id);
    const shallow = useIsApiReferenceShallowLink(node);

    const renderNode = useCallback(
        (node: FernNavigation.ApiPackageChild) => (
            <SidebarApiPackageChild node={node} depth={depth + 1} shallow={shallow} />
        ),
        [depth, shallow],
    );

    if (node.children.length === 0) {
        if (node.overviewPageId == null) {
            return null;
        }

        if (node.hidden && !selected) {
            return null;
        }

        return (
            <SidebarSlugLink
                nodeId={node.id}
                className={className}
                slug={node.slug}
                depth={Math.max(depth - 1, 0)}
                title={node.title}
                authed={node.authed}
                selected={selected}
                icon={node.icon}
                hidden={node.hidden}
                shallow={shallow}
            />
        );
    }

    if (node.hidden && !childSelected) {
        return null;
    }

    if (node.type === "apiReference" && node.hideTitle) {
        return (
            <ul className="fern-sidebar-group">
                {node.children.map((child) => (
                    <li key={child.id}>
                        <SidebarApiPackageChild node={child} depth={depth} shallow={shallow} />
                    </li>
                ))}
            </ul>
        );
    }

    const showIndicator = childSelected && !expanded;

    return (
        <CollapsibleSidebarGroup<FernNavigation.ApiPackageChild>
            open={expanded}
            nodes={node.children}
            renderNode={renderNode}
        >
            <SidebarSlugLink
                nodeId={node.id}
                icon={node.icon}
                className={className}
                depth={Math.max(depth - 1, 0)}
                title={node.title}
                expanded={expanded}
                toggleExpand={handleToggleExpand}
                showIndicator={showIndicator}
                hidden={node.hidden}
                authed={node.authed}
                slug={node.overviewPageId != null ? node.slug : undefined}
                selected={selected}
                shallow={shallow}
            />
        </CollapsibleSidebarGroup>
    );
}
