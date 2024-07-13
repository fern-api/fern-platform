import { useCurrentNodeId } from "@/atoms";
import { FernNavigation } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import { useCollapseSidebar } from "../CollapseSidebarContext";
import { SidebarSlugLink } from "../SidebarLink";
import { SidebarNavigationChild } from "./SidebarNavigationChild";
import { SidebarRootHeading } from "./SidebarRootHeading";

interface SidebarRootSectionNodeProps {
    node: FernNavigation.SectionNode;
    className?: string;
}

export function SidebarRootSectionNode({ node, className }: SidebarRootSectionNodeProps): React.ReactElement | null {
    const { checkChildSelected, registerScrolledToPathListener } = useCollapseSidebar();
    const selectedNodeId = useCurrentNodeId();

    if (node.children.length === 0) {
        if (node.overviewPageId == null) {
            return null;
        }

        if (node.hidden && selectedNodeId !== node.id) {
            return null;
        }

        return (
            <SidebarSlugLink
                nodeId={node.id}
                linkClassName="font-semibold !text-text-default"
                className={className}
                slug={node.slug}
                registerScrolledToPathListener={registerScrolledToPathListener}
                title={node.title}
                selected={node.id === selectedNodeId}
                icon={node.icon}
                hidden={node.hidden}
                shallow={selectedNodeId === node.id}
                scrollOnShallow={false}
            />
        );
    }

    const childSelected = checkChildSelected(node.id);

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
