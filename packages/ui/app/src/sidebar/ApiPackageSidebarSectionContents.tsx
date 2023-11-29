import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { getEndpointTitleAsString, isSubpackage, joinUrlSlugs } from "@fern-ui/app-utils";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { useNavigationContext } from "../navigation-context";
import { ApiSubpackages } from "./ApiSubpackages";
import { SidebarItem } from "./SidebarItem";

export declare namespace ApiPackageSidebarSectionContents {
    export interface Props {
        package: APIV1Read.ApiDefinitionPackage;
        slug: string;
        shallow?: boolean;
        registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
        closeMobileSidebar: () => void;
        selectedSlug: string | undefined;
        resolveSubpackageById: (subpackageId: APIV1Read.SubpackageId) => APIV1Read.ApiDefinitionSubpackage;
        docsDefinition: DocsV1Read.DocsDefinition;
        activeTabIndex: number | null;
    }
}

export const ApiPackageSidebarSectionContents: React.FC<ApiPackageSidebarSectionContents.Props> = ({
    package: package_,
    slug,
    shallow,
    registerScrolledToPathListener,
    closeMobileSidebar,
    selectedSlug,
    resolveSubpackageById,
    docsDefinition,
    activeTabIndex,
}) => {
    const { navigateToPath } = useNavigationContext();
    return (
        <div className="flex flex-col">
            {package_.endpoints.map((endpoint, endpointIndex) => {
                const fullSlug = joinUrlSlugs(slug, endpoint.urlSlug);
                return (
                    <SidebarItem
                        key={endpointIndex}
                        onClick={() => {
                            navigateToPath(fullSlug);
                            closeMobileSidebar();
                        }}
                        title={getEndpointTitleAsString(endpoint)}
                        rightElement={<HttpMethodTag className="ml-2" method={endpoint.method} small />}
                        indent={isSubpackage(package_)}
                        shallow={shallow}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        fullSlug={fullSlug}
                        isSelected={fullSlug === selectedSlug}
                    />
                );
            })}
            {package_.webhooks.map((webhook, webhookIndex) => {
                const fullSlug = joinUrlSlugs(slug, webhook.urlSlug);
                return (
                    <SidebarItem
                        key={webhookIndex}
                        onClick={() => {
                            navigateToPath(fullSlug);
                            closeMobileSidebar();
                        }}
                        title={webhook.name ?? ""}
                        indent={isSubpackage(package_)}
                        shallow={shallow}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        fullSlug={fullSlug}
                        isSelected={fullSlug === selectedSlug}
                    />
                );
            })}
            <ApiSubpackages
                package={package_}
                slug={slug}
                registerScrolledToPathListener={registerScrolledToPathListener}
                closeMobileSidebar={closeMobileSidebar}
                selectedSlug={selectedSlug}
                resolveSubpackageById={resolveSubpackageById}
                docsDefinition={docsDefinition}
                activeTabIndex={activeTabIndex}
            />
        </div>
    );
};
