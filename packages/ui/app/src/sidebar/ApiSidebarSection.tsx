import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useCallback, useMemo } from "react";
import { resolveSubpackage } from "../api-context/ApiDefinitionContextProvider";
import { areApiArtifactsNonEmpty } from "../api-page/artifacts/areApiArtifactsNonEmpty";
import { API_ARTIFACTS_TITLE } from "../config";
import { DocsInfo, NavigateToPathOpts } from "../docs-context/DocsContext";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiPackageSidebarSectionContents } from "./ApiPackageSidebarSectionContents";
import { NonClickableSidebarGroupTitle } from "./NonClickableSidebarGroupTitle";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItem } from "./SidebarItem";
export declare namespace ApiSidebarSection {
    export interface Props {
        slug: string;
        apiSection: FernRegistryDocsRead.ApiSection;
        selectedSlug: string | undefined;
        navigateToPath: (slugWithoutVersion: string, opts?: NavigateToPathOpts | undefined) => void;
        registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
        getFullSlug: (slug: string) => string;
        closeMobileSidebar: () => void;

        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        docsInfo: DocsInfo;
        activeTabIndex: number | null;
        resolveApi: (apiId: FernRegistry.ApiDefinitionId) => FernRegistryApiRead.ApiDefinition;
    }
}

export const ApiSidebarSection: React.FC<ApiSidebarSection.Props> = ({
    slug,
    selectedSlug,
    navigateToPath,
    registerScrolledToPathListener,
    getFullSlug,
    closeMobileSidebar,
    apiSection,
    docsDefinition,
    docsInfo,
    activeTabIndex,
    resolveApi,
}) => {
    const apiDefinition = useMemo(() => resolveApi(apiSection.api), [apiSection.api, resolveApi]);

    const resolveSubpackageById = useCallback(
        (subpackageId: FernRegistryApiRead.SubpackageId): FernRegistryApiRead.ApiDefinitionSubpackage => {
            return resolveSubpackage(apiDefinition, subpackageId);
        },
        [apiDefinition]
    );
    const innerSlug = joinUrlSlugs(slug, "client-libraries");
    const fullSlug = getFullSlug(joinUrlSlugs(innerSlug, "client-libraries"));
    return (
        <SidebarGroup title={<NonClickableSidebarGroupTitle title={apiSection.title} />} includeTopMargin>
            {apiSection.artifacts != null && areApiArtifactsNonEmpty(apiSection.artifacts) && (
                <SidebarItem
                    slug={innerSlug}
                    fullSlug={fullSlug}
                    title={API_ARTIFACTS_TITLE}
                    navigateToPath={navigateToPath}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    isSelected={fullSlug === selectedSlug}
                    closeMobileSidebar={closeMobileSidebar}
                />
            )}
            <ApiPackageSidebarSectionContents
                package={apiDefinition.rootPackage}
                slug={slug}
                // shallow={selectedSlug?.includes(slug) ?? false}
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
        </SidebarGroup>
    );
};
