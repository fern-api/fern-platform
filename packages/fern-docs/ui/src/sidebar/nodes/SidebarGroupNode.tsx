import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { SidebarNavigationChild } from "./SidebarNavigationChild";

interface SidebarGroupNodeProps {
    node: FernNavigation.SidebarGroupNode;
}

export function SidebarGroupNode({
    node,
}: SidebarGroupNodeProps): React.ReactElement {
    return (
        <ul className="fern-sidebar-group">
            {node.children.map((child) => (
                <li key={child.id}>
                    <SidebarNavigationChild node={child} depth={1} root />
                </li>
            ))}
        </ul>
    );
}
