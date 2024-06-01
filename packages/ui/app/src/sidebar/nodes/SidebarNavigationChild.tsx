import { FernNavigation } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarApiSectionNode } from "./SidebarApiSectionNode";
import { SidebarChangelogNode } from "./SidebarChangelogNode";
import { SidebarLinkNode } from "./SidebarLinkNode";
import { SidebarPageNode } from "./SidebarPageNode";
import { SidebarSectionNode } from "./SidebarSectionNode";

interface SidebarNavigationChildProps {
    node: FernNavigation.NavigationChild;
    depth: number;
}

export function SidebarNavigationChild({ node, depth }: SidebarNavigationChildProps): React.ReactElement {
    return visitDiscriminatedUnion(node)._visit({
        apiReference: (apiRef) => <SidebarApiSectionNode node={apiRef} depth={depth} />,
        section: (section) => <SidebarSectionNode node={section} depth={depth} />,
        page: (page) => <SidebarPageNode node={page} depth={depth} />,
        link: (link) => <SidebarLinkNode node={link} depth={depth} />,
        changelog: (changelog) => <SidebarChangelogNode node={changelog} depth={depth} />,
    });
}
