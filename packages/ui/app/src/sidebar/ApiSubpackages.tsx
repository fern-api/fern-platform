import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSubpackageSidebarSection } from "./ApiSubpackageSidebarSection";

export declare namespace ApiSubpackages {
    export interface Props {
        package: FernRegistryApiRead.ApiDefinitionPackage;
        slug: string;
        selectedSlug: string | undefined;
        getFullSlug: (slug: string) => string;
        resolveSubpackageById: (
            subpackageId: FernRegistryApiRead.SubpackageId
        ) => FernRegistryApiRead.ApiDefinitionSubpackage;
        registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        activeTabIndex: number | null;
        closeMobileSidebar: () => void;
    }
}

export const ApiSubpackages: React.FC<ApiSubpackages.Props> = ({
    slug,
    package: package_,
    selectedSlug,
    getFullSlug,
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
                        getFullSlug={getFullSlug}
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
