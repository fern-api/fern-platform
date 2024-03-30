import { FdrAPI } from "@fern-api/fdr-sdk";
import { joinUrlSlugs } from "@fern-ui/fdr-utils";
import { ResolvedApiDefinitionPackage, ResolvedTypeDefinition } from "../../util/resolver";
import { ApiPackageContents } from "../ApiPackageContents";
import { ApiPageMargins } from "../page-margins/ApiPageMargins";
import { useApiPageCenterElement } from "../useApiPageCenterElement";

export declare namespace ApiSubpackage {
    export interface Props {
        api: FdrAPI.ApiDefinitionId;
        types: Record<string, ResolvedTypeDefinition>;
        showErrors: boolean;
        apiDefinition: ResolvedApiDefinitionPackage;
        isLastInParentPackage: boolean;
        anchorIdParts: readonly string[];
        breadcrumbs: readonly string[];
    }
}

export const ApiSubpackage: React.FC<ApiSubpackage.Props> = ({
    api,
    types,
    showErrors,
    apiDefinition,
    isLastInParentPackage,
    anchorIdParts,
    breadcrumbs,
}) => {
    const subpackageSlug = joinUrlSlugs(...apiDefinition.slug);
    const { setTargetRef } = useApiPageCenterElement({ slug: subpackageSlug });
    return (
        <>
            <ApiPageMargins>
                <div
                    ref={setTargetRef}
                    data-route={`/${subpackageSlug}`.toLowerCase()}
                    className="scroll-mt-header-height"
                />
            </ApiPageMargins>
            <ApiPackageContents
                api={api}
                types={types}
                showErrors={showErrors}
                apiDefinition={apiDefinition}
                isLastInParentPackage={isLastInParentPackage}
                anchorIdParts={anchorIdParts}
                breadcrumbs={breadcrumbs}
            />
        </>
    );
};
