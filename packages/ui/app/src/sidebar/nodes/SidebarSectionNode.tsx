import { FernNavigation } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import { useCallback } from "react";
import { useCurrentNodeId } from "../../atoms";
import { useCollapseSidebar } from "../CollapseSidebarContext";
import { SidebarSlugLink } from "../SidebarLink";
import { SidebarNavigationChild } from "./SidebarNavigationChild";
import { SidebarPageNode } from "./SidebarPageNode";

interface SidebarSectionNodeProps {
    node: FernNavigation.SectionNode;
    depth: number;
    className?: string;
}

export function SidebarSectionNode({ node, className, depth }: SidebarSectionNodeProps): React.ReactElement | null {
    const { checkExpanded, toggleExpanded, checkChildSelected, registerScrolledToPathListener } = useCollapseSidebar();
    const handleToggleExpand = useCallback(() => toggleExpanded(node.id), [node.id, toggleExpanded]);
    const selectedNodeId = useCurrentNodeId();

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

    const childSelected = checkChildSelected(node.id);

    if (node.hidden && !childSelected) {
        return null;
    }

    const expanded =
        selectedNodeId === node.id || checkExpanded(node.id) || (childSelected && node.overviewPageId != null) || !node?.collapsed;
    const showIndicator = childSelected && !expanded;
    return (
        <SidebarSlugLink
            nodeId={node.id}
            icon={node.icon}
            className={className}
            depth={Math.max(depth - 1, 0)}
            registerScrolledToPathListener={registerScrolledToPathListener}
            title={node.title}
            expanded={expanded}
            toggleExpand={handleToggleExpand}
            showIndicator={showIndicator}
            hidden={node.hidden}
            slug={node.overviewPageId != null ? node.slug : undefined}
            selected={selectedNodeId === node.id}
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
