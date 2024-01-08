import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { joinUrlSlugs } from "@fern-ui/app-utils";
import { useCallback, useMemo } from "react";
import { resolveSubpackage } from "../api-context/ApiDefinitionContextProvider";
import { areApiArtifactsNonEmpty } from "../api-page/artifacts/areApiArtifactsNonEmpty";
import { API_ARTIFACTS_TITLE } from "../config";
import { useNavigationContext } from "../navigation-context";
import { ApiPackageSidebarSectionContents } from "./ApiPackageSidebarSectionContents";
import { NonClickableSidebarGroupTitle } from "./NonClickableSidebarGroupTitle";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItem } from "./SidebarItem";
export declare namespace ApiSidebarSection {
    export interface Props {
        slug: string;
        apiSection: DocsV1Read.ApiSection;
        selectedSlug: string | undefined;
        registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
        closeMobileSidebar: () => void;
        docsDefinition: DocsV1Read.DocsDefinition;
        activeTabIndex: number | null;
        resolveApi: (apiId: FdrAPI.ApiDefinitionId) => APIV1Read.ApiDefinition | undefined;
    }
}

export const ApiSidebarSection: React.FC<ApiSidebarSection.Props> = ({
    slug,
    selectedSlug,
    registerScrolledToPathListener,
    closeMobileSidebar,
    apiSection,
    docsDefinition,
    activeTabIndex,
    resolveApi,
}) => {
    const { navigateToPath } = useNavigationContext();
    const apiDefinition = useMemo(() => resolveApi(apiSection.api), [apiSection.api, resolveApi]);

    const resolveSubpackageById = useCallback(
        (subpackageId: APIV1Read.SubpackageId): APIV1Read.ApiDefinitionSubpackage | undefined => {
            return resolveSubpackage(apiDefinition, subpackageId);
        },
        [apiDefinition]
    );
    const innerSlug = joinUrlSlugs(slug, "client-libraries");
    const fullSlug = joinUrlSlugs(innerSlug, "client-libraries");
    return (
        <SidebarGroup title={<NonClickableSidebarGroupTitle title={apiSection.title} />} includeTopMargin>
            {apiSection.artifacts != null && areApiArtifactsNonEmpty(apiSection.artifacts) && (
                <SidebarItem
                    onClick={() => {
                        navigateToPath(fullSlug);
                        closeMobileSidebar();
                    }}
                    fullSlug={fullSlug}
                    title={API_ARTIFACTS_TITLE}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    isSelected={fullSlug === selectedSlug}
                />
            )}
            <ApiPackageSidebarSectionContents
                package={apiDefinition?.rootPackage}
                slug={slug}
                // shallow={selectedSlug?.includes(slug) ?? false}
                selectedSlug={selectedSlug}
                registerScrolledToPathListener={registerScrolledToPathListener}
                closeMobileSidebar={closeMobileSidebar}
                resolveSubpackageById={resolveSubpackageById}
                docsDefinition={docsDefinition}
                activeTabIndex={activeTabIndex}
            />
        </SidebarGroup>
    );
};
