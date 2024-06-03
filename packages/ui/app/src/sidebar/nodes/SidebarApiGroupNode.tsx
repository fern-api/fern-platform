import { FernNavigation } from "@fern-api/fdr-sdk";
import { SidebarApiSectionChild } from "./SidebarApiSectionChild";

interface SidebarApiGroupNodeProps {
    nodeChildren: (FernNavigation.ApiSectionChild | FernNavigation.ChangelogNode)[];
}
export function SidebarApiGroupNode({ nodeChildren }: SidebarApiGroupNodeProps): React.ReactElement {
    return (
        <ul className="fern-sidebar-group">
            {nodeChildren.map((child) => (
                <li key={child.id}>
                    <SidebarApiSectionChild node={child} depth={0} />
                </li>
            ))}
        </ul>
    );
}
