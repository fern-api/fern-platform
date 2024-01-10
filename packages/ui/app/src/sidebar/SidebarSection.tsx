import { Collapse } from "@blueprintjs/core";
import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { joinUrlSlugs } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { memo, useCallback } from "react";
import { ApiSidebarSection } from "./ApiSidebarSection";
import { useCollapseSidebar } from "./CollapseSidebarContext";
import { SidebarHeading } from "./SidebarHeading";
import { SidebarSlugLink } from "./SidebarLink";

export interface SidebarSectionProps {
    className?: string;
    slug: string;
    navigationItems: DocsV1Read.NavigationItem[];

    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;

    docsDefinition: DocsV1Read.DocsDefinition;
    activeTabIndex: number | null;
    resolveApi: (apiId: FdrAPI.ApiDefinitionId) => APIV1Read.ApiDefinition | undefined;

    topLevel?: boolean;
    nested?: boolean;
    depth: number;
}

interface ExpandableSidebarSectionProps extends SidebarSectionProps {
    title: string;
}

const UnmemoizedExpandableSidebarSection: React.FC<ExpandableSidebarSectionProps> = ({
    className,
    title,
    slug,
    navigationItems,
    registerScrolledToPathListener,
    docsDefinition,
    activeTabIndex,
    resolveApi,
    depth,
}) => {
    const { checkExpanded, toggleExpanded, selectedSlug } = useCollapseSidebar();
    const expanded = checkExpanded(slug);

    return (
        <SidebarSlugLink
            className={className}
            depth={Math.max(depth - 1, 0)}
            registerScrolledToPathListener={registerScrolledToPathListener}
            onClick={useCallback(() => {
                if (!expanded) {
                    toggleExpanded(slug);
                }
            }, [expanded, slug, toggleExpanded])}
            title={title}
            expanded={expanded}
            toggleExpand={useCallback(() => toggleExpanded(slug), [slug, toggleExpanded])}
            showIndicator={selectedSlug?.startsWith(slug) && !expanded}
        >
            <Collapse isOpen={expanded} transitionDuration={0} keepChildrenMounted={true}>
                <SidebarSection
                    slug={slug}
                    navigationItems={navigationItems}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    docsDefinition={docsDefinition}
                    activeTabIndex={activeTabIndex}
                    resolveApi={resolveApi}
                    depth={depth + 1}
                />
            </Collapse>
        </SidebarSlugLink>
    );
};

const ExpandableSidebarSection = memo(UnmemoizedExpandableSidebarSection);

const UnmemoizedSidebarSection: React.FC<SidebarSectionProps> = ({
    className,
    slug,
    navigationItems,
    registerScrolledToPathListener,
    docsDefinition,
    activeTabIndex,
    resolveApi,
    topLevel = false,
    depth,
}) => {
    const { selectedSlug } = useCollapseSidebar();

    if (navigationItems.length === 0) {
        return null;
    }

    return (
        <ul className={classNames(className, "list-none")}>
            {navigationItems.map((navigationItem, idx) =>
                visitDiscriminatedUnion(navigationItem, "type")._visit({
                    page: (pageMetadata) => {
                        const pageSlug = joinUrlSlugs(slug, pageMetadata.urlSlug);
                        const selected = selectedSlug === pageSlug;
                        return (
                            <SidebarSlugLink
                                key={pageSlug}
                                className={classNames({
                                    "mt-6": topLevel && !isPrevItemSidebarItem(navigationItems, idx),
                                })}
                                slug={pageSlug}
                                depth={Math.max(depth - 1, 0)}
                                registerScrolledToPathListener={registerScrolledToPathListener}
                                title={pageMetadata.title}
                                selected={selected}
                            />
                        );
                    },
                    section: (section) => {
                        const sectionSlug = joinUrlSlugs(slug, section.urlSlug);
                        if (depth === 0) {
                            return (
                                <li key={sectionSlug}>
                                    <SidebarHeading
                                        className={classNames({
                                            "mt-6": topLevel && !isPrevItemSidebarItem(navigationItems, idx),
                                        })}
                                        depth={depth}
                                        title={section.title}
                                    />
                                    <SidebarSection
                                        slug={sectionSlug}
                                        navigationItems={section.items}
                                        registerScrolledToPathListener={registerScrolledToPathListener}
                                        docsDefinition={docsDefinition}
                                        activeTabIndex={activeTabIndex}
                                        resolveApi={resolveApi}
                                        depth={depth + 1}
                                    />
                                </li>
                            );
                        } else {
                            return (
                                <ExpandableSidebarSection
                                    key={sectionSlug}
                                    className={classNames({
                                        "mt-6": topLevel && !isPrevItemSidebarItem(navigationItems, idx),
                                    })}
                                    title={section.title}
                                    slug={sectionSlug}
                                    navigationItems={section.items}
                                    registerScrolledToPathListener={registerScrolledToPathListener}
                                    docsDefinition={docsDefinition}
                                    activeTabIndex={activeTabIndex}
                                    resolveApi={resolveApi}
                                    depth={depth}
                                />
                            );
                        }
                    },
                    api: (apiSection) => {
                        const apiSectionSlug = joinUrlSlugs(slug, apiSection.urlSlug);
                        return (
                            <li key={apiSectionSlug}>
                                <SidebarHeading
                                    className={classNames({
                                        "mt-6": topLevel && !isPrevItemSidebarItem(navigationItems, idx),
                                    })}
                                    depth={depth}
                                    title={apiSection.title}
                                />
                                <ApiSidebarSection
                                    slug={apiSectionSlug}
                                    apiSection={apiSection}
                                    registerScrolledToPathListener={registerScrolledToPathListener}
                                    resolveApi={resolveApi}
                                    depth={depth + 1}
                                />
                            </li>
                        );
                    },
                    _other: () => null,
                })
            )}
        </ul>
    );
};

export const SidebarSection = memo(UnmemoizedSidebarSection);

function isPrevItemSidebarItem(navigationItems: DocsV1Read.NavigationItem[], idx: number): boolean {
    if (idx === 0) {
        return false;
    }
    const prevItem = navigationItems[idx - 1];
    return prevItem != null && prevItem.type === "page";
}
