import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useContext, useMemo } from "react";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { doesSubpackageHaveEndpointsOrWebhooksRecursive } from "../api-page/subpackages/doesSubpackageHaveEndpointsOrWebhooksRecursive";
import { SubpackageTitle } from "../api-page/subpackages/SubpackageTitle";
import { useDocsContext } from "../docs-context/useDocsContext";
import { ApiPackageSidebarSectionContents } from "./ApiPackageSidebarSectionContents";
import { SidebarContext } from "./context/SidebarContext";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";
import { SidebarGroup } from "./SidebarGroup";

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
        <SidebarGroup
            title={
                <NavigatingSidebarItem
                    className="mt-1"
                    title={<SubpackageTitle subpackage={subpackage} />}
                    leftElement={<HiOutlineChevronDown />}
                    slug={slug}
                />
            }
        >
            {isOpen && <ApiPackageSidebarSectionContents package={subpackage} slug={slug} />}
        </SidebarGroup>
    );
};
