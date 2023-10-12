import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { NonClickableSidebarGroupTitle } from "./NonClickableSidebarGroupTitle";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItems } from "./SidebarItems";

export declare namespace SidebarDocsSection {
    export interface Props {
        slug: string;
        section: FernRegistryDocsRead.DocsSection;

        selectedSlug: string | undefined;
        registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
        closeMobileSidebar: () => void;
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        activeTabIndex: number | null;
        resolveApi: (apiId: FernRegistry.ApiDefinitionId) => FernRegistryApiRead.ApiDefinition;
    }
}

export const SidebarDocsSection: React.FC<SidebarDocsSection.Props> = ({
    slug,
    section,
    selectedSlug,
    registerScrolledToPathListener,
    closeMobileSidebar,
    docsDefinition,
    activeTabIndex,
    resolveApi,
}) => {
    return (
        <SidebarGroup title={<NonClickableSidebarGroupTitle title={section.title} />} includeTopMargin>
            <SidebarItems
                slug={slug}
                navigationItems={section.items}
                selectedSlug={selectedSlug}
                registerScrolledToPathListener={registerScrolledToPathListener}
                closeMobileSidebar={closeMobileSidebar}
                docsDefinition={docsDefinition}
                activeTabIndex={activeTabIndex}
                resolveApi={resolveApi}
            />
        </SidebarGroup>
    );
};
