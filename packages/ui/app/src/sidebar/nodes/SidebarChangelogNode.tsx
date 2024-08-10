import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { Calendar } from "iconoir-react";
import { useIsSelectedSidebarNode } from "../../atoms";
import { Changelog } from "../../util/dateUtils";
import { SidebarSlugLink } from "../SidebarLink";

export interface SidebarChangelogNodeProps {
    node: FernNavigation.ChangelogNode;
    depth: number;
    className?: string;
}

export function SidebarChangelogNode({ node, depth, className }: SidebarChangelogNodeProps): React.ReactElement | null {
    const selected = useIsSelectedSidebarNode(node.id);

    if (node.hidden && !selected) {
        return null;
    }

    return (
        <SidebarSlugLink
            nodeId={node.id}
            slug={node.slug}
            title={node.title}
            className={className}
            selected={selected}
            depth={Math.max(0, depth - 1)}
            icon={node.icon ?? <Calendar />}
            tooltipContent={renderChangelogTooltip(node)}
            hidden={node.hidden}
        />
    );
}

function renderChangelogTooltip(changelog: FernNavigation.ChangelogNode): string | undefined {
    const latestChange: FernNavigation.ChangelogEntryNode | undefined = changelog.children[0]?.children[0]?.children[0];

    if (latestChange == null) {
        return undefined;
    }

    return `Last updated ${Changelog.toCalendarDate(latestChange.date)}`;
}
