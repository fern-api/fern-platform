import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { joinUrlSlugs } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
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
        resolveApi: (apiId: FdrAPI.ApiDefinitionId) => APIV1Read.ApiDefinition;
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
}) => {
    const { navigateToPath } = useNavigationContext();

    return (
        <div className="flex flex-col">
            {navigationItems.map((navigationItem) =>
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
                        />
                    ),
                    api: (apiSection) => {
                        return (
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
                        );
                    },
                    _other: () => null,
                })
            )}
        </div>
    );
};

export const SidebarItems = memo(UnmemoizedSidebarItems);
