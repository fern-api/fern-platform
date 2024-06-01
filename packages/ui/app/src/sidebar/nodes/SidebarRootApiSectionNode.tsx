import { FernNavigation } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import { useCollapseSidebar } from "../CollapseSidebarContext";
import { SidebarApiSectionChild } from "./SidebarApiSectionChild";

export interface SidebarRootApiSectionNodeProps {
    node: FernNavigation.ApiReferenceNode | FernNavigation.ApiSectionNode;
    className?: string;
}

export function SidebarRootApiSectionNode({
    node,
    className,
}: SidebarRootApiSectionNodeProps): React.ReactElement | null {
    const { checkChildSelected } = useCollapseSidebar();
    const childSelected = checkChildSelected(node.id);

    if (node.hidden && !childSelected) {
        return null;
    }
    return (
        <>
            <div className={clsx("fern-sidebar-heading px-4 lg:px-3 flex items-center", className)}>
                <h6 className="m-0 text-base leading-6 lg:text-sm lg:leading-5">{node.title}</h6>
            </div>

            <ul className={clsx("fern-sidebar-group")}>
                {node.children.map((child) => (
                    <li key={child.id}>
                        <SidebarApiSectionChild node={child} depth={1} />
                    </li>
                ))}
            </ul>
        </>
    );
}
