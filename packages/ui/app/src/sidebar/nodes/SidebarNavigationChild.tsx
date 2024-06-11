import { FernNavigation } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import clsx from "clsx";
import { SidebarApiPackageNode } from "./SidebarApiPackageNode";
import { SidebarChangelogNode } from "./SidebarChangelogNode";
import { SidebarLinkNode } from "./SidebarLinkNode";
import { SidebarPageNode } from "./SidebarPageNode";
import { SidebarSectionNode } from "./SidebarSectionNode";

interface SidebarNavigationChildProps {
    node: FernNavigation.NavigationChild;
    depth: number;
    root?: boolean;
}

export function SidebarNavigationChild({ node, depth, root }: SidebarNavigationChildProps): React.ReactElement {
    return visitDiscriminatedUnion(node)._visit({
        apiReference: (apiRef) => <SidebarApiPackageNode node={apiRef} depth={depth} />,
        section: (section) => (
            <SidebarSectionNode
                node={section}
                depth={depth}
                className={clsx({ "font-semibold !text-text-default": root })}
            />
        ),
        page: (page) => <SidebarPageNode node={page} depth={depth} />,
        link: (link) => <SidebarLinkNode node={link} depth={depth} />,
        changelog: (changelog) => <SidebarChangelogNode node={changelog} depth={depth} />,
    });
}
