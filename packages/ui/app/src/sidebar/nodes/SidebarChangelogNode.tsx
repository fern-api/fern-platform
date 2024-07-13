import { FernNavigation } from "@fern-api/fdr-sdk";
import { ActivityLogIcon } from "@radix-ui/react-icons";
import { useCurrentNodeId } from "../../atoms";
import { Changelog } from "../../util/dateUtils";
import { useCollapseSidebar } from "../CollapseSidebarContext";
import { SidebarSlugLink } from "../SidebarLink";

export interface SidebarChangelogNodeProps {
    node: FernNavigation.ChangelogNode;
    depth: number;
    className?: string;
}

export function SidebarChangelogNode({ node, depth, className }: SidebarChangelogNodeProps): React.ReactElement | null {
    const { registerScrolledToPathListener } = useCollapseSidebar();
    const selectedNodeId = useCurrentNodeId();

    if (node.hidden && selectedNodeId === node.id) {
        return null;
    }

    return (
        <SidebarSlugLink
            nodeId={node.id}
            slug={node.slug}
            title={node.title}
            className={className}
            registerScrolledToPathListener={registerScrolledToPathListener}
            selected={node.id === selectedNodeId}
            depth={Math.max(0, depth - 1)}
            icon={node.icon ?? <ActivityLogIcon />}
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
