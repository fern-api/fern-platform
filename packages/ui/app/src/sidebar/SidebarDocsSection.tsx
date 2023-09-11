import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { DocsInfo, NavigateToPathOpts } from "../docs-context/DocsContext";
import { NonClickableSidebarGroupTitle } from "./NonClickableSidebarGroupTitle";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItems } from "./SidebarItems";

export declare namespace SidebarDocsSection {
    export interface Props {
        slug: string;
        section: FernRegistryDocsRead.DocsSection;

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

export const SidebarDocsSection: React.FC<SidebarDocsSection.Props> = ({
    slug,
    section,
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
        <SidebarGroup title={<NonClickableSidebarGroupTitle title={section.title} />} includeTopMargin>
            <SidebarItems
                slug={slug}
                navigationItems={section.items}
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
        </SidebarGroup>
    );
};
