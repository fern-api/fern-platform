import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { UnreachableCaseError } from "ts-essentials";
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
    switch (node.type) {
        case "apiReference":
            return <SidebarApiPackageNode node={node} depth={depth} />;
        case "section":
            return (
                <SidebarSectionNode
                    node={node}
                    depth={depth}
                    className={clsx({ "font-semibold !text-text-default": root })}
                />
            );
        case "page":
            return <SidebarPageNode node={node} depth={depth} />;
        case "link":
            return <SidebarLinkNode node={node} depth={depth} />;
        case "changelog":
            return <SidebarChangelogNode node={node} depth={depth} />;
        default:
            throw new UnreachableCaseError(node);
    }
}
