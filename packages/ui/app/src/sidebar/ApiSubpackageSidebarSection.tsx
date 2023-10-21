import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { doesSubpackageHaveEndpointsOrWebhooksRecursive, getSubpackageTitle } from "@fern-ui/app-utils";
import { useRouter } from "next/router";
import { useContext, useMemo } from "react";
import { ApiPackageSidebarSectionContents } from "./ApiPackageSidebarSectionContents";
import { SidebarContext } from "./context/SidebarContext";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarSubpackageItem } from "./SidebarSubpackageItem";

export declare namespace ApiSubpackageSidebarSection {
    export interface Props {
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        slug: string;
        selectedSlug: string | undefined;
        resolveSubpackageById: (
            subpackageId: FernRegistryApiRead.SubpackageId
        ) => FernRegistryApiRead.ApiDefinitionSubpackage;
        registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
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
    const router = useRouter();
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
                    isChildSelected={isChildSelected}
                    fullSlug={slug}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    docsDefinition={docsDefinition}
                    activeTabIndex={activeTabIndex}
                    closeMobileSidebar={closeMobileSidebar}
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
