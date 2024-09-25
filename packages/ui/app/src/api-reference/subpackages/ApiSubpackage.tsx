import type { FdrAPI } from "@fern-api/fdr-sdk/client/types";
import { useRef } from "react";
import { useHref } from "../../hooks/useHref";
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
        breadcrumb: readonly string[];
    }
}

export const ApiSubpackage: React.FC<ApiSubpackage.Props> = ({
    api,
    types,
    showErrors,
    apiDefinition,
    isLastInParentPackage,
    anchorIdParts,
    breadcrumb,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    useApiPageCenterElement(ref, apiDefinition.slug, true);

    return (
        <>
            <div ref={ref} className="scroll-mt-content" id={useHref(apiDefinition.slug)} />
            <ApiPackageContents
                api={api}
                types={types}
                showErrors={showErrors}
                apiDefinition={apiDefinition}
                isLastInParentPackage={isLastInParentPackage}
                anchorIdParts={anchorIdParts}
                breadcrumb={breadcrumb}
            />
        </>
    );
};
