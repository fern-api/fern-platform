import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { doesSubpackageHaveEndpointsOrWebhooksRecursive, getSubpackageTitle } from "@fern-ui/app-utils";
import { useContext, useMemo } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { useDocsContext } from "../docs-context/useDocsContext";
import { ApiPackageSidebarSectionContents } from "./ApiPackageSidebarSectionContents";
import { SidebarContext } from "./context/SidebarContext";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarSubpackageItem } from "./SidebarSubpackageItem";

export declare namespace ApiSubpackageSidebarSection {
    export interface Props {
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        slug: string;
        isFirstItemInApi?: boolean;
        shallow: boolean;
    }
}

export const ApiSubpackageSidebarSection: React.FC<ApiSubpackageSidebarSection.Props> = ({
    subpackage,
    slug,
    shallow,
}) => {
    const { selectedSlug, getFullSlug } = useDocsContext();
    const { resolveSubpackageById } = useApiDefinitionContext();

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
                    shallow={shallow}
                />
            }
        >
            {isOpen && <ApiPackageSidebarSectionContents package={subpackage} slug={slug} shallow={shallow} />}
        </SidebarGroup>
    );
};
