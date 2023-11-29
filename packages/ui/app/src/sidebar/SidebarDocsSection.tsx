import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { NonClickableSidebarGroupTitle } from "./NonClickableSidebarGroupTitle";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItems } from "./SidebarItems";

export declare namespace SidebarDocsSection {
    export interface Props {
        slug: string;
        section: DocsV1Read.DocsSection;

        selectedSlug: string | undefined;
        registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
        closeMobileSidebar: () => void;
        docsDefinition: DocsV1Read.DocsDefinition;
        activeTabIndex: number | null;
        resolveApi: (apiId: FdrAPI.ApiDefinitionId) => APIV1Read.ApiDefinition;
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
