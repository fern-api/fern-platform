import { FernNavigation } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { ActivityLogIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { useCallback } from "react";
import { Changelog } from "../util/dateUtils";
import { useCollapseSidebar } from "./CollapseSidebarContext";
import { SidebarLink, SidebarSlugLink } from "./SidebarLink";

interface SidebarRootNodeProps {
    node: FernNavigation.SidebarRootNode;
}

export function SidebarRootNode({ node }: SidebarRootNodeProps): React.ReactElement {
    return (
        <ul className="fern-sidebar-group">
            {node.children.map((child) => (
                <li key={child.id}>
                    {visitDiscriminatedUnion(child, "type")._visit({
                        sidebarGroup: (group) => <SidebarGroupNode node={group} />,
                        apiReference: (apiRef) => <ApiReferenceNode node={apiRef} depth={0} />,
                        section: (section) => <SectionNode node={section} depth={0} />,
                        _other: () => null,
                    })}
                </li>
            ))}
        </ul>
    );
}

interface SidebarGroupNodeProps {
    node: FernNavigation.SidebarGroupNode;
}

export function SidebarGroupNode({ node }: SidebarGroupNodeProps): React.ReactElement {
    return (
        <ul className="fern-sidebar-group">
            {node.children.map((child) => (
                <li key={child.id}>
                    <NavigationChild node={child} depth={0} />
                </li>
            ))}
        </ul>
    );
}

interface NavigationChildProps {
    node: FernNavigation.NavigationChild;
    depth: number;
}

export function NavigationChild({ node, depth }: NavigationChildProps): React.ReactElement {
    return visitDiscriminatedUnion(node)._visit({
        apiReference: (apiRef) => <ApiReferenceNode node={apiRef} depth={depth} />,
        section: (section) => <SectionNode node={section} depth={depth} />,
        page: (page) => <PageNode node={page} depth={depth} />,
        link: (link) => <LinkNode node={link} depth={depth} />,
        changelog: (changelog) => <ChangelogNode node={changelog} depth={depth} />,
    });
}

interface SectionNodeProps {
    node: FernNavigation.SectionNode;
    depth: number;
    className?: string;
}

export function SectionNode({ node, className, depth }: SectionNodeProps): React.ReactElement {
    const { checkExpanded, toggleExpanded, checkChildSelected, registerScrolledToPathListener } = useCollapseSidebar();
    const expanded = checkExpanded(node.id);
    const showIndicator = checkChildSelected(node.id) && !expanded;

    return (
        <SidebarSlugLink
            icon={node.icon}
            className={className}
            depth={Math.max(depth - 1, 0)}
            registerScrolledToPathListener={registerScrolledToPathListener}
            title={node.title}
            expanded={expanded}
            toggleExpand={useCallback(() => toggleExpanded(node.id), [node.id, toggleExpanded])}
            showIndicator={showIndicator}
            hidden={node.hidden}
        >
            <ul className="fern-sidebar-group">
                {node.children.map((child) => (
                    <li key={child.id}>
                        <NavigationChild node={child} depth={depth + 1} />
                    </li>
                ))}
            </ul>
        </SidebarSlugLink>
    );
}

export interface ApiReferenceNodeProps {
    node: FernNavigation.ApiReferenceNode;
    depth: number;
    className?: string;
}

export function ApiReferenceNode({ node, depth, className }: ApiReferenceNodeProps): React.ReactElement {
    const { checkExpanded, toggleExpanded, checkChildSelected, registerScrolledToPathListener } = useCollapseSidebar();
    const expanded = checkExpanded(node.id);
    const showIndicator = checkChildSelected(node.id) && !expanded;

    return (
        <SidebarSlugLink
            icon={node.icon}
            className={className}
            depth={Math.max(depth - 1, 0)}
            registerScrolledToPathListener={registerScrolledToPathListener}
            title={node.title}
            expanded={expanded}
            toggleExpand={useCallback(() => toggleExpanded(node.id), [node.id, toggleExpanded])}
            showIndicator={showIndicator}
            hidden={node.hidden}
        >
            {/* <ul className="fern-sidebar-group">
                {node.children.map((child) => (
                    <li key={child.id}>
                        <NavigationChild node={child} depth={depth + 1} />
                    </li>
                ))}
            </ul> */}
        </SidebarSlugLink>
    );
}

interface LinkNodeProps {
    node: FernNavigation.LinkNode;
    depth: number;
    className?: string;
}

export function LinkNode({ node, depth, className }: LinkNodeProps): React.ReactElement {
    return (
        <SidebarLink
            className={className}
            depth={Math.max(depth - 1, 0)}
            title={node.title}
            rightElement={<ExternalLinkIcon />}
            href={node.url}
            target={"_blank"}
            hidden={false}
        />
    );
}

interface PageNodeProps {
    node: FernNavigation.PageNode;
    depth: number;
    className?: string;
}

export function PageNode({ node, depth, className }: PageNodeProps): React.ReactElement {
    const { selectedNodeId, registerScrolledToPathListener } = useCollapseSidebar();
    return (
        <SidebarSlugLink
            className={className}
            slug={node.slug}
            depth={Math.max(depth - 1, 0)}
            registerScrolledToPathListener={registerScrolledToPathListener}
            title={node.title}
            selected={node.id === selectedNodeId}
            icon={node.icon}
            hidden={node.hidden}
            shallow={selectedNodeId === node.id}
            scrollOnShallow={true}
        />
    );
}

export interface ChangelogNodeProps {
    node: FernNavigation.ChangelogNode;
    depth: number;
    className?: string;
}

export function ChangelogNode({ node, depth, className }: ChangelogNodeProps): React.ReactElement {
    const { registerScrolledToPathListener, selectedNodeId } = useCollapseSidebar();
    return (
        <SidebarSlugLink
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
