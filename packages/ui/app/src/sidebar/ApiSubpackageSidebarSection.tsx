import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useContext, useMemo } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { useDocsContext } from "../docs-context/useDocsContext";
import { doesSubpackageHaveEndpointsOrWebhooksRecursive, getSubpackageTitle } from "../util/subpackage";
import { ApiPackageSidebarSectionContents } from "./ApiPackageSidebarSectionContents";
import { SidebarContext } from "./context/SidebarContext";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarSubpackageItem } from "./SidebarSubpackageItem";

export declare namespace ApiSubpackageSidebarSection {
    export interface Props {
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        slug: string;
        isFirstItemInApi?: boolean;
    }
}

export const ApiSubpackageSidebarSection: React.FC<ApiSubpackageSidebarSection.Props> = ({ subpackage, slug }) => {
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
        <SidebarGroup title={<SidebarSubpackageItem title={getSubpackageTitle(subpackage)} slug={slug} />}>
            {isOpen && <ApiPackageSidebarSectionContents package={subpackage} slug={slug} />}
        </SidebarGroup>
    );
};
