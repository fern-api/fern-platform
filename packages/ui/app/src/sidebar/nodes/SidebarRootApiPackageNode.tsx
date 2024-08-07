import { FernNavigation } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import { useCurrentNodeId, useIsChildSelected } from "../../atoms";
import { SidebarSlugLink } from "../SidebarLink";
import { SidebarApiPackageChild } from "./SidebarApiPackageChild";
import { SidebarRootHeading } from "./SidebarRootHeading";

export interface SidebarRootApiPackageNodeProps {
    node: FernNavigation.ApiReferenceNode | FernNavigation.ApiPackageNode;
    className?: string;
}

export function SidebarRootApiPackageNode({
    node,
    className,
}: SidebarRootApiPackageNodeProps): React.ReactElement | null {
    const selectedNodeId = useCurrentNodeId();
    const childSelected = useIsChildSelected(node.id);

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
                title={node.title}
                selected={node.id === selectedNodeId}
                icon={node.icon}
                hidden={node.hidden}
                shallow={selectedNodeId === node.id}
                scrollOnShallow={false}
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
                        <SidebarApiPackageChild node={child} depth={1} />
                    </li>
                ))}
                {node.type === "apiReference" && node.changelog != null && (
                    <li>
                        <SidebarApiPackageChild node={node.changelog} depth={1} />
                    </li>
                )}
            </ul>
        </>
    );
}
