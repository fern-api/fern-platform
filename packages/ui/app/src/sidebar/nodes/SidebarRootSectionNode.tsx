import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import clsx from "clsx";
import { useIsChildSelected, useIsSelectedSidebarNode } from "../../atoms";
import { SidebarSlugLink } from "../SidebarLink";
import { SidebarNavigationChild } from "./SidebarNavigationChild";
import { SidebarRootHeading } from "./SidebarRootHeading";

interface SidebarRootSectionNodeProps {
    node: FernNavigation.SectionNode;
    className?: string;
}

export function SidebarRootSectionNode({ node, className }: SidebarRootSectionNodeProps): React.ReactElement | null {
    const selected = useIsSelectedSidebarNode(node.id);
    const childSelected = useIsChildSelected(node.id);

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
                linkClassName="font-semibold !text-text-default"
                className={className}
                slug={node.slug}
                title={node.title}
                selected={selected}
                icon={node.icon}
                hidden={node.hidden}
                authed={node.authed}
            />
        );
    }

    if (node.hidden && !childSelected) {
        return null;
    }

    return (
        <>
            <SidebarRootHeading node={node} className={className} />

            <ul className={clsx("fern-sidebar-group")}>
                {node.children.map((child) => (
                    <li key={child.id}>
                        <SidebarNavigationChild node={child} depth={1} />
                    </li>
                ))}
            </ul>
        </>
    );
}
