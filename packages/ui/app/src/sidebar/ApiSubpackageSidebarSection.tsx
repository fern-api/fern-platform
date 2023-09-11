import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { doesSubpackageHaveEndpointsOrWebhooksRecursive, getSubpackageTitle } from "@fern-ui/app-utils";
import { useRouter } from "next/router";
import { useContext, useMemo } from "react";
import { DocsInfo, NavigateToPathOpts } from "../docs-context/DocsContext";
import { ApiPackageSidebarSectionContents } from "./ApiPackageSidebarSectionContents";
import { SidebarContext } from "./context/SidebarContext";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarSubpackageItem } from "./SidebarSubpackageItem";

export declare namespace ApiSubpackageSidebarSection {
    export interface Props {
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        slug: string;
        selectedSlug: string | undefined;
        getFullSlug: (slug: string) => string;
        resolveSubpackageById: (
            subpackageId: FernRegistryApiRead.SubpackageId
        ) => FernRegistryApiRead.ApiDefinitionSubpackage;
        navigateToPath: (slugWithoutVersion: string, opts?: NavigateToPathOpts | undefined) => void;
        registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        docsInfo: DocsInfo;
        activeTabIndex: number | null;
        closeMobileSidebar: () => void;
    }
}

export const ApiSubpackageSidebarSection: React.FC<ApiSubpackageSidebarSection.Props> = ({
    subpackage,
    slug,
    selectedSlug,
    getFullSlug,
    resolveSubpackageById,
    navigateToPath,
    registerScrolledToPathListener,
    docsDefinition,
    docsInfo,
    activeTabIndex,
    closeMobileSidebar,
}) => {
    const router = useRouter();
    const hasEndpointsOrWebhooks = useMemo(
        () => doesSubpackageHaveEndpointsOrWebhooksRecursive(subpackage.subpackageId, resolveSubpackageById),
        [resolveSubpackageById, subpackage.subpackageId]
    );

    const isSelected = selectedSlug != null && selectedSlug === getFullSlug(slug);
    const isChildSelected = selectedSlug != null && selectedSlug.startsWith(`${getFullSlug(slug)}/`);
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
                    slug={slug}
                    getFullSlug={getFullSlug}
                    navigateToPath={navigateToPath}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    docsDefinition={docsDefinition}
                    docsInfo={docsInfo}
                    activeTabIndex={activeTabIndex}
                    closeMobileSidebar={closeMobileSidebar}
                    pushRoute={router.push}
                />
            }
        >
            {isOpen && (
                <ApiPackageSidebarSectionContents
                    package={subpackage}
                    slug={slug}
                    shallow={true}
                    selectedSlug={selectedSlug}
                    navigateToPath={navigateToPath}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    getFullSlug={getFullSlug}
                    closeMobileSidebar={closeMobileSidebar}
                    resolveSubpackageById={resolveSubpackageById}
                    docsDefinition={docsDefinition}
                    docsInfo={docsInfo}
                    activeTabIndex={activeTabIndex}
                />
            )}
        </SidebarGroup>
    );
};
