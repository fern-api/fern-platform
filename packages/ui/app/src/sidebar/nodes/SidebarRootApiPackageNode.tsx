import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import clsx from "clsx";
import { useIsApiReferenceShallowLink, useIsChildSelected, useIsSelectedSidebarNode } from "../../atoms";
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
    const selected = useIsSelectedSidebarNode(node.id);
    const childSelected = useIsChildSelected(node.id);
    const shallow = useIsApiReferenceShallowLink(node);

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
                shallow={shallow}
            />
        );
    }

    if (node.hidden && !childSelected) {
        return null;
    }

    return (
        <>
            <SidebarRootHeading node={node} className={className} shallow={shallow} />

            <ul className={clsx("fern-sidebar-group")}>
                {node.children.map((child) => (
                    <li key={child.id}>
                        <SidebarApiPackageChild node={child} depth={1} shallow={shallow} />
                    </li>
                ))}
                {node.type === "apiReference" && node.changelog != null && (
                    <li>
                        <SidebarApiPackageChild node={node.changelog} depth={1} shallow={shallow} />
                    </li>
                )}
            </ul>
        </>
    );
}
