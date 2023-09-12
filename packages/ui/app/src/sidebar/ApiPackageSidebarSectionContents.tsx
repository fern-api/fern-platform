import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { getEndpointTitleAsString, isSubpackage } from "@fern-ui/app-utils";
import { DocsInfo, NavigateToPathOpts } from "../docs-context/DocsContext";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSubpackages } from "./ApiSubpackages";
import { SidebarItem } from "./SidebarItem";

export declare namespace ApiPackageSidebarSectionContents {
    export interface Props {
        package: FernRegistryApiRead.ApiDefinitionPackage;
        slug: string;
        shallow?: boolean;
        navigateToPath: (slugWithoutVersion: string, opts?: NavigateToPathOpts | undefined) => void;
        registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
        getFullSlug: (slug: string) => string;
        closeMobileSidebar: () => void;

        selectedSlug: string | undefined;
        resolveSubpackageById: (
            subpackageId: FernRegistryApiRead.SubpackageId
        ) => FernRegistryApiRead.ApiDefinitionSubpackage;
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        docsInfo: DocsInfo;
        activeTabIndex: number;
    }
}

export const ApiPackageSidebarSectionContents: React.FC<ApiPackageSidebarSectionContents.Props> = ({
    package: package_,
    slug,
    shallow,
    navigateToPath,
    registerScrolledToPathListener,
    getFullSlug,
    closeMobileSidebar,
    selectedSlug,
    resolveSubpackageById,
    docsDefinition,
    docsInfo,
    activeTabIndex,
}) => {
    return (
        <div className="flex flex-col">
            {package_.endpoints.map((endpoint, endpointIndex) => (
                <SidebarItem
                    key={endpointIndex}
                    slug={joinUrlSlugs(slug, endpoint.urlSlug)}
                    title={getEndpointTitleAsString(endpoint)}
                    indent={isSubpackage(package_)}
                    shallow={shallow}
                    navigateToPath={navigateToPath}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    fullSlug={getFullSlug(joinUrlSlugs(slug, endpoint.urlSlug))}
                    closeMobileSidebar={closeMobileSidebar}
                    isSelected={getFullSlug(joinUrlSlugs(slug, endpoint.urlSlug)) === selectedSlug}
                />
            ))}
            {package_.webhooks.map((webhook, webhookIndex) => (
                <SidebarItem
                    key={webhookIndex}
                    slug={joinUrlSlugs(slug, webhook.urlSlug)}
                    title={webhook.name ?? ""}
                    indent={isSubpackage(package_)}
                    shallow={shallow}
                    navigateToPath={navigateToPath}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    fullSlug={getFullSlug(joinUrlSlugs(slug, webhook.urlSlug))}
                    closeMobileSidebar={closeMobileSidebar}
                    isSelected={getFullSlug(joinUrlSlugs(slug, webhook.urlSlug)) === selectedSlug}
                />
            ))}
            <ApiSubpackages
                package={package_}
                slug={slug}
                navigateToPath={navigateToPath}
                registerScrolledToPathListener={registerScrolledToPathListener}
                getFullSlug={getFullSlug}
                closeMobileSidebar={closeMobileSidebar}
                selectedSlug={selectedSlug}
                resolveSubpackageById={resolveSubpackageById}
                docsDefinition={docsDefinition}
                docsInfo={docsInfo}
                activeTabIndex={activeTabIndex}
            />
        </div>
    );
};
