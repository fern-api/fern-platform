import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { joinUrlSlugs } from "@fern-ui/app-utils";
import { ApiSubpackageSidebarSection } from "./ApiSubpackageSidebarSection";

export declare namespace ApiSubpackages {
    export interface Props {
        package: FernRegistryApiRead.ApiDefinitionPackage;
        slug: string;
        selectedSlug: string | undefined;
        resolveSubpackageById: (
            subpackageId: FernRegistryApiRead.SubpackageId
        ) => FernRegistryApiRead.ApiDefinitionSubpackage;
        registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
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
