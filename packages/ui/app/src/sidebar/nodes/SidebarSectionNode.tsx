import { FernNavigation } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import {
    useIsChildSelected,
    useIsExpandedSidebarNode,
    useIsSelectedSidebarNode,
    useToggleExpandedSidebarNode,
} from "../../atoms";
import { SidebarSlugLink } from "../SidebarLink";
import { SidebarNavigationChild } from "./SidebarNavigationChild";
import { SidebarPageNode } from "./SidebarPageNode";

interface SidebarSectionNodeProps {
    node: FernNavigation.SectionNode;
    depth: number;
    className?: string;
}

export function SidebarSectionNode({ node, className, depth }: SidebarSectionNodeProps): React.ReactElement | null {
    const selected = useIsSelectedSidebarNode(node.id);
    const handleToggleExpand = useToggleExpandedSidebarNode(node.id);
    const childSelected = useIsChildSelected(node.id);
    const expanded = useIsExpandedSidebarNode(node.id);

    if (node.children.length === 0) {
        if (node.overviewPageId != null) {
            return (
                <SidebarPageNode
                    node={{
                        ...node,
                        type: "page",
                        pageId: node.overviewPageId,
                    }}
                    depth={depth}
                    className={className}
                />
            );
        }
        return null;
    }

    if (node.hidden && !childSelected) {
        return null;
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
                        <SidebarNavigationChild node={child} depth={depth + 1} />
                    </li>
                ))}
            </ul>
        </SidebarSlugLink>
    );
}
