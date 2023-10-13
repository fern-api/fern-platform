import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
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
        navigationItems: FernRegistryDocsRead.NavigationItem[];

        selectedSlug: string | undefined;
        registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
        closeMobileSidebar: () => void;

        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        activeTabIndex: number | null;
        resolveApi: (apiId: FernRegistry.ApiDefinitionId) => FernRegistryApiRead.ApiDefinition;
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
