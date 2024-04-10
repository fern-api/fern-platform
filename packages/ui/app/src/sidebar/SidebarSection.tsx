import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { joinUrlSlugs, SidebarNode } from "@fern-ui/fdr-utils";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { isEqual } from "lodash-es";
import { Fragment, memo, useCallback, useMemo } from "react";
import { checkSlugStartsWith, useCollapseSidebar } from "./CollapseSidebarContext";
import { ExpandableSidebarApiSection, SidebarApiSection } from "./SidebarApiSection";
import { SidebarHeading } from "./SidebarHeading";
import { SidebarLink, SidebarSlugLink } from "./SidebarLink";

export interface SidebarSectionProps {
    className?: string;
    navigationItems: SidebarNode[];
    slug: readonly string[];

    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;

    topLevel?: boolean;
    nested?: boolean;
    depth: number;
}

interface ExpandableSidebarSectionProps extends SidebarSectionProps {
    title: string;
    hidden: boolean;
    icon: string | undefined;
}

const ExpandableSidebarSection: React.FC<ExpandableSidebarSectionProps> = ({
    className,
    title,
    slug,
    navigationItems,
    registerScrolledToPathListener,
    depth,
    icon,
    hidden,
}) => {
    const { checkExpanded, toggleExpanded, selectedSlug } = useCollapseSidebar();
    const expanded = checkExpanded(slug);

    const children = useMemo(
        () => (
            <SidebarSection
                className={cn("expandable", { hidden: !expanded })}
                slug={slug}
                navigationItems={navigationItems}
                registerScrolledToPathListener={registerScrolledToPathListener}
                depth={depth + 1}
            />
        ),
        [expanded, slug, navigationItems, registerScrolledToPathListener, depth],
    );

    return (
        <SidebarSlugLink
            icon={icon}
            className={className}
            depth={Math.max(depth - 1, 0)}
            registerScrolledToPathListener={registerScrolledToPathListener}
            title={title}
            expanded={expanded}
            toggleExpand={useCallback(() => toggleExpanded(slug), [slug, toggleExpanded])}
            showIndicator={selectedSlug != null && checkSlugStartsWith(selectedSlug, slug) && !expanded}
            hidden={hidden}
        >
            {children}
        </SidebarSlugLink>
    );
};

export const SidebarSection = memo<SidebarSectionProps>(function SidebarSection({
    className,
    navigationItems,
    registerScrolledToPathListener,
    topLevel = false,
    depth,
}) {
    const { selectedSlug } = useCollapseSidebar();

    if (navigationItems.length === 0) {
        return null;
    }

    return (
        <ul className={cn(className, "fern-sidebar-group")}>
            {navigationItems.map((navigationItem, idx) =>
                visitDiscriminatedUnion(navigationItem, "type")._visit({
                    pageGroup: ({ pages }) => (
                        <Fragment key={idx}>
                            {pages.map((page, pageIdx) =>
                                visitDiscriminatedUnion(page, "type")._visit({
                                    link: (link) => (
                                        <SidebarLink
                                            key={pageIdx}
                                            className={cn({
                                                "mt-6": topLevel && pageIdx === 0,
                                            })}
                                            depth={Math.max(depth - 1, 0)}
                                            title={link.title}
                                            rightElement={<ExternalLinkIcon />}
                                            href={link.url}
                                            target={"_blank"}
                                            hidden={false}
                                        />
                                    ),
                                    section: (section) => (
                                        <ExpandableSidebarSection
                                            key={pageIdx}
                                            title={section.title}
                                            className={cn({
                                                "mt-6": topLevel && pageIdx === 0,
                                            })}
                                            slug={section.slug}
                                            navigationItems={section.items}
                                            registerScrolledToPathListener={registerScrolledToPathListener}
                                            depth={depth + 1}
                                            icon={section.icon}
                                            hidden={section.hidden}
                                        />
                                    ),
                                    page: (page) => (
                                        <SidebarSlugLink
                                            key={pageIdx}
                                            className={cn({
                                                "mt-6": topLevel && pageIdx === 0,
                                            })}
                                            slug={page.slug}
                                            depth={Math.max(depth - 1, 0)}
                                            registerScrolledToPathListener={registerScrolledToPathListener}
                                            title={page.title}
                                            selected={isEqual(selectedSlug, page.slug)}
                                            icon={page.icon}
                                            hidden={page.hidden}
                                            shallow={isEqual(selectedSlug, page.slug)}
                                            scrollOnShallow={true}
                                        />
                                    ),
                                    _other: () => null,
                                }),
                            )}
                        </Fragment>
                    ),
                    section: (section) => {
                        const sectionSlug = joinUrlSlugs(...section.slug);
                        if (depth === 0) {
                            return (
                                <li key={sectionSlug}>
                                    <SidebarHeading
                                        className={cn({
                                            "mt-6": topLevel,
                                        })}
                                        depth={depth}
                                        title={section.title}
                                        icon={section.icon}
                                        hidden={section.hidden}
                                        slug={section.slug}
                                    >
                                        <SidebarSection
                                            slug={section.slug}
                                            navigationItems={section.items}
                                            registerScrolledToPathListener={registerScrolledToPathListener}
                                            depth={depth + 1}
                                        />
                                    </SidebarHeading>
                                </li>
                            );
                        } else {
                            return (
                                <ExpandableSidebarSection
                                    key={sectionSlug}
                                    className={cn({
                                        "mt-6": topLevel,
                                    })}
                                    title={section.title}
                                    slug={section.slug}
                                    navigationItems={section.items}
                                    registerScrolledToPathListener={registerScrolledToPathListener}
                                    depth={depth}
                                    icon={section.icon}
                                    hidden={section.hidden}
                                />
                            );
                        }
                    },
                    apiSection: (apiSection) =>
                        depth === 0 ? (
                            <li key={apiSection.id}>
                                {apiSection.summaryPage != null ? (
                                    <SidebarSlugLink
                                        className={cn("top-level", {
                                            "mt-6": topLevel,
                                        })}
                                        depth={depth}
                                        title={apiSection.summaryPage.title}
                                        as={"h6"}
                                        slug={apiSection.summaryPage.slug}
                                        icon={apiSection.summaryPage.icon}
                                        hidden={apiSection.summaryPage.hidden}
                                        registerScrolledToPathListener={registerScrolledToPathListener}
                                        selected={isEqual(selectedSlug, apiSection.summaryPage.slug)}
                                    >
                                        <SidebarApiSection
                                            slug={apiSection.slug}
                                            apiSection={apiSection}
                                            registerScrolledToPathListener={registerScrolledToPathListener}
                                            depth={depth + 1}
                                        />
                                    </SidebarSlugLink>
                                ) : (
                                    <SidebarHeading
                                        className={cn({
                                            "mt-6": topLevel,
                                        })}
                                        depth={depth}
                                        title={apiSection.title}
                                        slug={apiSection.slug}
                                        icon={apiSection.icon}
                                        hidden={apiSection.hidden}
                                    >
                                        <SidebarApiSection
                                            slug={apiSection.slug}
                                            apiSection={apiSection}
                                            registerScrolledToPathListener={registerScrolledToPathListener}
                                            depth={depth + 1}
                                        />
                                    </SidebarHeading>
                                )}
                            </li>
                        ) : (
                            <ExpandableSidebarApiSection
                                slug={apiSection.slug}
                                apiSection={apiSection}
                                registerScrolledToPathListener={registerScrolledToPathListener}
                                depth={depth}
                                title={apiSection.title}
                                artifacts={apiSection.artifacts}
                            />
                        ),
                    _other: () => null,
                }),
            )}
        </ul>
    );
});
