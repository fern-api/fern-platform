import { Collapse } from "@blueprintjs/core";
import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { joinUrlSlugs } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import classNames from "classnames";
import { useEffect } from "react";
import { ApiSidebarSection } from "./ApiSidebarSection";
import { SidebarHeading } from "./SidebarHeading";
import { SidebarLink } from "./SidebarLink";

export interface SidebarSectionProps {
    className?: string;
    slug: string;
    navigationItems: DocsV1Read.NavigationItem[];

    selectedSlug: string | undefined;
    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
    closeMobileSidebar: () => void;

    docsDefinition: DocsV1Read.DocsDefinition;
    activeTabIndex: number | null;
    resolveApi: (apiId: FdrAPI.ApiDefinitionId) => APIV1Read.ApiDefinition;

    topLevel?: boolean;
    nested?: boolean;
    depth: number;
}

interface ExpandableSidebarSectionProps extends SidebarSectionProps {
    title: string;
}

const ExpandableSidebarSection: React.FC<ExpandableSidebarSectionProps> = ({
    className,
    title,
    slug,
    navigationItems,
    selectedSlug,
    registerScrolledToPathListener,
    closeMobileSidebar,
    docsDefinition,
    activeTabIndex,
    resolveApi,
    depth,
}) => {
    const {
        value: expanded,
        setTrue: setExpanded,
        toggleValue: toggleExpand,
    } = useBooleanState(selectedSlug?.startsWith(slug) ?? false);

    useEffect(() => {
        if (selectedSlug?.startsWith(slug)) {
            setExpanded();
        }
    }, [selectedSlug, setExpanded, slug]);

    return (
        <SidebarLink
            className={className}
            slug={slug}
            depth={Math.max(depth - 1, 0)}
            registerScrolledToPathListener={registerScrolledToPathListener}
            onClick={closeMobileSidebar}
            title={title}
            expanded={expanded}
            toggleExpand={toggleExpand}
            showIndicator={selectedSlug?.startsWith(slug) && !expanded}
        >
            <Collapse isOpen={expanded}>
                <SidebarSection
                    slug={slug}
                    navigationItems={navigationItems}
                    selectedSlug={selectedSlug}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    closeMobileSidebar={closeMobileSidebar}
                    docsDefinition={docsDefinition}
                    activeTabIndex={activeTabIndex}
                    resolveApi={resolveApi}
                    depth={depth + 1}
                />
            </Collapse>
        </SidebarLink>
    );
};

export const SidebarSection: React.FC<SidebarSectionProps> = ({
    className,
    slug,
    navigationItems,
    selectedSlug,
    registerScrolledToPathListener,
    closeMobileSidebar,
    docsDefinition,
    activeTabIndex,
    resolveApi,
    topLevel = false,
    depth,
}) => {
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
                            <SidebarLink
                                key={pageSlug}
                                className={classNames({
                                    "mt-6": topLevel && !isPrevItemSidebarItem(navigationItems, idx),
                                })}
                                slug={pageSlug}
                                depth={Math.max(depth - 1, 0)}
                                registerScrolledToPathListener={registerScrolledToPathListener}
                                onClick={closeMobileSidebar}
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
                                        selectedSlug={selectedSlug}
                                        registerScrolledToPathListener={registerScrolledToPathListener}
                                        closeMobileSidebar={closeMobileSidebar}
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
                                    selectedSlug={selectedSlug}
                                    registerScrolledToPathListener={registerScrolledToPathListener}
                                    closeMobileSidebar={closeMobileSidebar}
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
                                    selectedSlug={selectedSlug}
                                    registerScrolledToPathListener={registerScrolledToPathListener}
                                    closeMobileSidebar={closeMobileSidebar}
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

function isPrevItemSidebarItem(navigationItems: DocsV1Read.NavigationItem[], idx: number): boolean {
    if (idx === 0) {
        return false;
    }
    const prevItem = navigationItems[idx - 1];
    return prevItem != null && prevItem.type === "page";
}
