import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { SidebarApiPackageChild } from "./SidebarApiPackageChild";

interface SidebarApiGroupNodeProps {
    nodeChildren: (FernNavigation.ApiPackageChild | FernNavigation.ChangelogNode)[];
    shallow: boolean;
}
export function SidebarApiGroupNode({ nodeChildren, shallow }: SidebarApiGroupNodeProps): React.ReactElement {
    return (
        <ul className="fern-sidebar-group">
            {nodeChildren.map((child) => (
                <li key={child.id}>
                    <SidebarApiPackageChild node={child} depth={0} shallow={shallow} />
                </li>
            ))}
        </ul>
    );
}
