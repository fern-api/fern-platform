import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type { FdrAPI } from "@fern-api/fdr-sdk/client/types";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useRef } from "react";
import { useHref } from "../../hooks/useHref";
import { ApiPackageContents } from "../ApiPackageContents";
import { useApiPageCenterElement } from "../useApiPageCenterElement";

export declare namespace ApiSubpackage {
    export interface Props {
        api: FdrAPI.ApiDefinitionId;
        types: Record<string, ApiDefinition.TypeDefinition>;
        showErrors: boolean;
        node: FernNavigation.ApiPackageNode | FernNavigation.ApiReferenceNode;
        isLastInParentPackage: boolean;
        anchorIdParts: readonly string[];
        breadcrumbs: readonly string[];
    }
}

export const ApiSubpackage: React.FC<ApiSubpackage.Props> = ({
    api,
    types,
    showErrors,
    node,
    isLastInParentPackage,
    anchorIdParts,
    breadcrumbs,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    useApiPageCenterElement(ref, node.slug, true);

    return (
        <>
            <div ref={ref} className="scroll-mt-content" id={useHref(node.slug)} />
            <ApiPackageContents
                api={api}
                types={types}
                showErrors={showErrors}
                node={node}
                isLastInParentPackage={isLastInParentPackage}
                anchorIdParts={anchorIdParts}
                breadcrumbs={breadcrumbs}
            />
        </>
    );
};
