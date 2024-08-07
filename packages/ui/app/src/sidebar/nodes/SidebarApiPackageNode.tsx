import { FernNavigation } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import {
    useIsChildSelected,
    useIsExpandedSidebarNode,
    useIsSelectedSidebarNode,
    useToggleExpandedSidebarNode,
} from "../../atoms";
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
                selected={selected}
                icon={node.icon}
                hidden={node.hidden}
                scrollOnShallow={false}
            />
        );
    }

    if (node.hidden && !childSelected) {
        return null;
    }

    if (node.type === "apiReference" && node.hideTitle) {
        return (
            <ul className={clsx("fern-sidebar-group")}>
                {node.children.map((child) => (
                    <li key={child.id}>
                        <SidebarApiPackageChild node={child} depth={depth} />
                    </li>
                ))}
            </ul>
        );
    }

    const showIndicator = childSelected && !expanded;

    return (
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
            slug={node.overviewPageId != null ? node.slug : undefined}
            selected={selected}
        >
            <ul
                className={clsx("fern-sidebar-group", {
                    hidden: !expanded,
                })}
            >
                {node.children.map((child) => (
                    <li key={child.id}>
                        <SidebarApiPackageChild node={child} depth={depth + 1} />
                    </li>
                ))}
            </ul>
        </SidebarSlugLink>
    );
}
