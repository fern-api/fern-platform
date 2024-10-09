import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { SidebarApiPackageNode } from "./SidebarApiPackageNode";
import { SidebarLinkNode } from "./SidebarLinkNode";
import { SidebarPageNode } from "./SidebarPageNode";
import { SidebarSectionNode } from "./SidebarSectionNode";

const SidebarChangelogNode = dynamic(
    () => import("./SidebarChangelogNode").then(({ SidebarChangelogNode }) => SidebarChangelogNode),
    { ssr: true },
);

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
