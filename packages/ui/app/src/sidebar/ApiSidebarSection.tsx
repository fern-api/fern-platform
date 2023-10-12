import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
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
        apiSection: FernRegistryDocsRead.ApiSection;
        selectedSlug: string | undefined;
        registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
        closeMobileSidebar: () => void;
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        activeTabIndex: number | null;
        resolveApi: (apiId: FernRegistry.ApiDefinitionId) => FernRegistryApiRead.ApiDefinition;
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
        (subpackageId: FernRegistryApiRead.SubpackageId): FernRegistryApiRead.ApiDefinitionSubpackage => {
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
                package={apiDefinition.rootPackage}
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
