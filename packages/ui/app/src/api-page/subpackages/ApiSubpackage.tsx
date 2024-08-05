import { FdrAPI } from "@fern-api/fdr-sdk";
import { ResolvedApiDefinitionPackage, ResolvedTypeDefinition } from "../../resolver/types";
import { ApiPackageContents } from "../ApiPackageContents";
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
    const { setTargetRef } = useApiPageCenterElement({ slug: apiDefinition.slug });
    return (
        <>
            <div ref={setTargetRef} className="scroll-mt-content" id={`/${apiDefinition.slug}`} />
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
