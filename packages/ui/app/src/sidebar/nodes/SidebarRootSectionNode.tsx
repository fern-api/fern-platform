import { FernNavigation } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import { useCollapseSidebar } from "../CollapseSidebarContext";
import { SidebarSlugLink } from "../SidebarLink";
import { SidebarNavigationChild } from "./SidebarNavigationChild";

interface SidebarRootSectionNodeProps {
    node: FernNavigation.SectionNode;
    className?: string;
}

export function SidebarRootSectionNode({ node, className }: SidebarRootSectionNodeProps): React.ReactElement | null {
    const { checkChildSelected, registerScrolledToPathListener, selectedNodeId } = useCollapseSidebar();

    if (node.children.length === 0) {
        if (node.overviewPageId == null) {
            return null;
        }

        if (node.hidden && selectedNodeId !== node.id) {
            return null;
        }

        return (
            <SidebarSlugLink
                linkClassName="font-semibold !text-text-default"
                className={className}
                slug={node.slug}
                registerScrolledToPathListener={registerScrolledToPathListener}
                title={node.title}
                selected={node.id === selectedNodeId}
                icon={node.icon}
                hidden={node.hidden}
                shallow={selectedNodeId === node.id}
                scrollOnShallow={true}
            />
        );
    }

    const childSelected = checkChildSelected(node.id);

    if (node.hidden && !childSelected) {
        return null;
    }

    return (
        <>
            {node.overviewPageId == null ? (
                <div className={clsx("fern-sidebar-heading px-4 lg:px-3 flex items-center", className)}>
                    <h6 className="m-0 text-base leading-6 lg:text-sm lg:leading-5">{node.title}</h6>
                </div>
            ) : (
                <SidebarSlugLink
                    linkClassName="font-semibold !text-text-default"
                    icon={node.icon}
                    className={className}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    title={node.title}
                    hidden={node.hidden}
                    slug={node.slug}
                    selected={node.id === selectedNodeId}
                />
            )}

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
