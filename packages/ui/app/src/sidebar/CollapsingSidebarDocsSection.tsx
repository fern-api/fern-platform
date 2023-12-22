import { Collapse } from "@blueprintjs/core";
import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { useBooleanState } from "@fern-ui/react-commons";
import { CollapsableSidebarItem } from "./CollapsableSidebarItem";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItems } from "./SidebarItems";

export declare namespace CollapsingSidebarDocsSection {
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

export const CollapsingSidebarDocsSection: React.FC<CollapsingSidebarDocsSection.Props> = ({
    slug,
    section,
    selectedSlug,
    registerScrolledToPathListener,
    closeMobileSidebar,
    docsDefinition,
    activeTabIndex,
    resolveApi,
}) => {
    const collapsed = useBooleanState(true);
    return (
        <SidebarGroup
            title={
                <CollapsableSidebarItem
                    title={section.title}
                    collapsed={collapsed.value}
                    onClick={collapsed.toggleValue}
                />
            }
            includeTopMargin={false}
        >
            <Collapse isOpen={!collapsed.value}>
                <SidebarItems
                    slug={slug}
                    navigationItems={section.items}
                    selectedSlug={selectedSlug}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    closeMobileSidebar={closeMobileSidebar}
                    docsDefinition={docsDefinition}
                    activeTabIndex={activeTabIndex}
                    resolveApi={resolveApi}
                    nested={true}
                    indent={true}
                />
            </Collapse>
        </SidebarGroup>
    );
};
