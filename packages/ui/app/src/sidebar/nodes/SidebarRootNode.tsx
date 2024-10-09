import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { memo } from "react";
import { SidebarGroupNode } from "./SidebarGroupNode";
import { SidebarRootApiReferenceNode } from "./SidebarRootApiReferenceNode";
import { SidebarRootSectionNode } from "./SidebarRootSectionNode";

interface SidebarRootNodeProps {
    node: FernNavigation.SidebarRootNode | undefined;
}

export const SidebarRootNode = memo(function SidebarRootNode({ node }: SidebarRootNodeProps): React.ReactElement {
    return (
        <ul className="fern-sidebar-group">
            {node?.children.map((child) =>
                visitDiscriminatedUnion(child, "type")._visit({
                    sidebarGroup: (group) => (
                        <li key={child.id} className="mt-6">
                            <SidebarGroupNode node={group} />
                        </li>
                    ),
                    apiReference: (apiRef) => <SidebarRootApiReferenceNode key={child.id} node={apiRef} />,
                    section: (section) => (
                        <li key={child.id} className="mt-6">
                            <SidebarRootSectionNode node={section} />
                        </li>
                    ),
                    _other: () => null,
                }),
            )}
        </ul>
    );
});
