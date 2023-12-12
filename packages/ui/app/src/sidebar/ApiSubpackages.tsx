import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { joinUrlSlugs } from "@fern-ui/app-utils";
import { ApiSubpackageSidebarSection } from "./ApiSubpackageSidebarSection";

export declare namespace ApiSubpackages {
    export interface Props {
        package: APIV1Read.ApiDefinitionPackage;
        slug: string;
        selectedSlug: string | undefined;
        resolveSubpackageById: (subpackageId: APIV1Read.SubpackageId) => APIV1Read.ApiDefinitionSubpackage;
        registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
        docsDefinition: DocsV1Read.DocsDefinition;
        activeTabIndex: number | null;
        closeMobileSidebar: () => void;
    }
}

export const ApiSubpackages: React.FC<ApiSubpackages.Props> = ({
    slug,
    package: package_,
    selectedSlug,
    resolveSubpackageById,
    registerScrolledToPathListener,
    docsDefinition,
    activeTabIndex,
    closeMobileSidebar,
}) => {
    return (
        <>
            {package_.subpackages.map((subpackageId) => {
                const subpackage = resolveSubpackageById(subpackageId);
                return (
                    <ApiSubpackageSidebarSection
                        key={subpackageId}
                        subpackage={subpackage}
                        slug={joinUrlSlugs(slug, subpackage.urlSlug)}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        docsDefinition={docsDefinition}
                        activeTabIndex={activeTabIndex}
                        closeMobileSidebar={closeMobileSidebar}
                        selectedSlug={selectedSlug}
                        resolveSubpackageById={resolveSubpackageById}
                    />
                );
            })}
        </>
    );
};
