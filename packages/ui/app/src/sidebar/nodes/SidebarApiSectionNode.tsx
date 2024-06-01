import { FernNavigation } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import { useCallback } from "react";
import { useCollapseSidebar } from "../CollapseSidebarContext";
import { SidebarSlugLink } from "../SidebarLink";
import { SidebarApiSectionChild } from "./SidebarApiSectionChild";

export interface SidebarApiSectionNodeProps {
    node: FernNavigation.ApiReferenceNode | FernNavigation.ApiSectionNode;
    depth: number;
    className?: string;
}

export function SidebarApiSectionNode({
    node,
    depth,
    className,
}: SidebarApiSectionNodeProps): React.ReactElement | null {
    const { checkExpanded, toggleExpanded, checkChildSelected, registerScrolledToPathListener } = useCollapseSidebar();
    const expanded = checkExpanded(node.id);
    const childSelected = checkChildSelected(node.id);
    const showIndicator = childSelected && !expanded;

    const handleToggleExpand = useCallback(() => toggleExpanded(node.id), [node.id, toggleExpanded]);

    if (node.hidden && !childSelected) {
        return null;
    }

    if (node.type === "apiReference" && node.hideTitle) {
        return (
            <ul className={clsx("fern-sidebar-group")}>
                {node.children.map((child) => (
                    <li key={child.id}>
                        <SidebarApiSectionChild node={child} depth={depth} />
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <SidebarSlugLink
            icon={node.icon}
            className={className}
            depth={Math.max(depth - 1, 0)}
            registerScrolledToPathListener={registerScrolledToPathListener}
            title={node.title}
            expanded={expanded}
            toggleExpand={handleToggleExpand}
            showIndicator={showIndicator}
            hidden={node.hidden}
        >
            <ul
                className={clsx("fern-sidebar-group", {
                    hidden: !expanded,
                })}
            >
                {node.children.map((child) => (
                    <li key={child.id}>
                        <SidebarApiSectionChild node={child} depth={depth + 1} />
                    </li>
                ))}
            </ul>
        </SidebarSlugLink>
    );
}
