import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { joinUrlSlugs } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { memo } from "react";
import { useNavigationContext } from "../navigation-context";
import { ApiSidebarSection } from "./ApiSidebarSection";
import { SidebarDocsSection } from "./SidebarDocsSection";
import { SidebarItem } from "./SidebarItem";

export declare namespace SidebarItems {
    export interface Props {
        slug: string;
        navigationItems: DocsV1Read.NavigationItem[];

        selectedSlug: string | undefined;
        registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
        closeMobileSidebar: () => void;

        docsDefinition: DocsV1Read.DocsDefinition;
        activeTabIndex: number | null;
        resolveApi: (apiId: FdrAPI.ApiDefinitionId) => APIV1Read.ApiDefinition | undefined;

        level: number;
    }
}

const UnmemoizedSidebarItems: React.FC<SidebarItems.Props> = ({
    slug,
    navigationItems,
    selectedSlug,
    registerScrolledToPathListener,
    closeMobileSidebar,
    docsDefinition,
    activeTabIndex,
    resolveApi,
    level,
}) => {
    const { navigateToPath } = useNavigationContext();

    return (
        <ul className="list-none">
            {navigationItems.map((navigationItem, idx) =>
                visitDiscriminatedUnion(navigationItem, "type")._visit({
                    page: (pageMetadata) => {
                        const fullSlug = joinUrlSlugs(slug, pageMetadata.urlSlug);
                        return (
                            <SidebarItem
                                key={pageMetadata.urlSlug}
                                onClick={() => {
                                    navigateToPath(fullSlug);
                                    closeMobileSidebar();
                                }}
                                fullSlug={fullSlug}
                                title={pageMetadata.title}
                                registerScrolledToPathListener={registerScrolledToPathListener}
                                isSelected={fullSlug === selectedSlug}
                                className={classNames({
                                    "mt-6": level === 0 && !isPrevItemSidebarItem(navigationItems, idx),
                                })}
                            />
                        );
                    },
                    section: (section) => (
                        <SidebarDocsSection
                            key={section.urlSlug}
                            slug={joinUrlSlugs(slug, section.urlSlug)}
                            section={section}
                            selectedSlug={selectedSlug}
                            registerScrolledToPathListener={registerScrolledToPathListener}
                            closeMobileSidebar={closeMobileSidebar}
                            docsDefinition={docsDefinition}
                            activeTabIndex={activeTabIndex}
                            resolveApi={resolveApi}
                            level={level}
                        />
                    ),
                    api: (apiSection) => (
                        <ApiSidebarSection
                            key={apiSection.urlSlug}
                            slug={joinUrlSlugs(slug, apiSection.urlSlug)}
                            apiSection={apiSection}
                            selectedSlug={selectedSlug}
                            registerScrolledToPathListener={registerScrolledToPathListener}
                            closeMobileSidebar={closeMobileSidebar}
                            docsDefinition={docsDefinition}
                            activeTabIndex={activeTabIndex}
                            resolveApi={resolveApi}
                        />
                    ),
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

export const SidebarItems = memo(UnmemoizedSidebarItems);
