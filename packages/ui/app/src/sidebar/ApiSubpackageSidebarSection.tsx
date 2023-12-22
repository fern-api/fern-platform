import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { doesSubpackageHaveEndpointsOrWebhooksRecursive, getSubpackageTitle } from "@fern-ui/app-utils";
import { useContext, useMemo } from "react";
import { ApiPackageSidebarSectionContents } from "./ApiPackageSidebarSectionContents";
import { SidebarContext } from "./context/SidebarContext";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarSubpackageItem } from "./SidebarSubpackageItem";

export declare namespace ApiSubpackageSidebarSection {
    export interface Props {
        subpackage: APIV1Read.ApiDefinitionSubpackage;
        slug: string;
        selectedSlug: string | undefined;
        resolveSubpackageById: (subpackageId: APIV1Read.SubpackageId) => APIV1Read.ApiDefinitionSubpackage;
        registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
        docsDefinition: DocsV1Read.DocsDefinition;
        activeTabIndex: number | null;
        closeMobileSidebar: () => void;
    }
}

export const ApiSubpackageSidebarSection: React.FC<ApiSubpackageSidebarSection.Props> = ({
    subpackage,
    slug,
    selectedSlug,
    resolveSubpackageById,
    registerScrolledToPathListener,
    docsDefinition,
    activeTabIndex,
    closeMobileSidebar,
}) => {
    const hasEndpointsOrWebhooks = useMemo(
        () => doesSubpackageHaveEndpointsOrWebhooksRecursive(subpackage.subpackageId, resolveSubpackageById),
        [resolveSubpackageById, subpackage.subpackageId]
    );

    const isSelected = selectedSlug != null && selectedSlug === slug;
    const isChildSelected = selectedSlug != null && selectedSlug.startsWith(`${slug}/`);
    const { expandAllSections } = useContext(SidebarContext)();
    const isOpen = isSelected || isChildSelected || expandAllSections;

    if (!hasEndpointsOrWebhooks) {
        return null;
    }

    return (
        <SidebarGroup
            title={
                <SidebarSubpackageItem
                    title={getSubpackageTitle(subpackage)}
                    collapsed={!isChildSelected}
                    fullSlug={slug}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                />
            }
        >
            {isOpen && (
                <ApiPackageSidebarSectionContents
                    package={subpackage}
                    slug={slug}
                    shallow={true}
                    selectedSlug={selectedSlug}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    closeMobileSidebar={closeMobileSidebar}
                    resolveSubpackageById={resolveSubpackageById}
                    docsDefinition={docsDefinition}
                    activeTabIndex={activeTabIndex}
                />
            )}
        </SidebarGroup>
    );
};
