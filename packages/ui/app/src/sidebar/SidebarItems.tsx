import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { memo } from "react";
import { DocsInfo, NavigateToPathOpts } from "../docs-context/DocsContext";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSidebarSection } from "./ApiSidebarSection";
import { SidebarDocsSection } from "./SidebarDocsSection";
import { SidebarItem } from "./SidebarItem";

export declare namespace SidebarItems {
    export interface Props {
        slug: string;
        navigationItems: FernRegistryDocsRead.NavigationItem[];

        selectedSlug: string | undefined;
        navigateToPath: (slugWithoutVersion: string, opts?: NavigateToPathOpts | undefined) => void;
        registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
        getFullSlug: (slug: string) => string;
        closeMobileSidebar: () => void;

        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        docsInfo: DocsInfo;
        activeTabIndex: number;
        resolveApi: (apiId: FernRegistry.ApiDefinitionId) => FernRegistryApiRead.ApiDefinition;
    }
}

const UnmemoizedSidebarItems: React.FC<SidebarItems.Props> = ({
    slug,
    navigationItems,
    selectedSlug,
    navigateToPath,
    registerScrolledToPathListener,
    getFullSlug,
    closeMobileSidebar,
    docsDefinition,
    docsInfo,
    activeTabIndex,
    resolveApi,
}) => {
    return (
        <div className="flex flex-col">
            {navigationItems.map((navigationItem) =>
                visitDiscriminatedUnion(navigationItem, "type")._visit({
                    page: (pageMetadata) => (
                        <SidebarItem
                            key={pageMetadata.urlSlug}
                            slug={joinUrlSlugs(slug, pageMetadata.urlSlug)}
                            fullSlug={getFullSlug(joinUrlSlugs(slug, pageMetadata.urlSlug))}
                            title={pageMetadata.title}
                            navigateToPath={navigateToPath}
                            registerScrolledToPathListener={registerScrolledToPathListener}
                            isSelected={getFullSlug(joinUrlSlugs(slug, pageMetadata.urlSlug)) === selectedSlug}
                            closeMobileSidebar={closeMobileSidebar}
                        />
                    ),
                    section: (section) => (
                        <SidebarDocsSection
                            key={section.urlSlug}
                            slug={joinUrlSlugs(slug, section.urlSlug)}
                            section={section}
                            selectedSlug={selectedSlug}
                            navigateToPath={navigateToPath}
                            registerScrolledToPathListener={registerScrolledToPathListener}
                            getFullSlug={getFullSlug}
                            closeMobileSidebar={closeMobileSidebar}
                            docsDefinition={docsDefinition}
                            docsInfo={docsInfo}
                            activeTabIndex={activeTabIndex}
                            resolveApi={resolveApi}
                        />
                    ),
                    api: (apiSection) => (
                        <ApiSidebarSection
                            key={apiSection.urlSlug}
                            slug={joinUrlSlugs(slug, apiSection.urlSlug)}
                            apiSection={apiSection}
                            selectedSlug={selectedSlug}
                            navigateToPath={navigateToPath}
                            registerScrolledToPathListener={registerScrolledToPathListener}
                            getFullSlug={getFullSlug}
                            closeMobileSidebar={closeMobileSidebar}
                            docsDefinition={docsDefinition}
                            docsInfo={docsInfo}
                            activeTabIndex={activeTabIndex}
                            resolveApi={resolveApi}
                        />
                    ),
                    _other: () => null,
                })
            )}
        </div>
    );
};

export const SidebarItems = memo(UnmemoizedSidebarItems);
