import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import React, { useCallback } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { ApiDefinitionContext } from "./ApiDefinitionContext";

export declare namespace ApiDefinitionContextProvider {
    export type Props = React.PropsWithChildren<{
        apiSection: DocsV1Read.ApiSection;
    }>;
}

export const ApiDefinitionContextProvider: React.FC<ApiDefinitionContextProvider.Props> = ({
    apiSection,
    children,
}) => {
    const { resolveApi } = useDocsContext();
    const apiDefinition = resolveApi(apiSection.api);
    const apiSlug = apiSection.skipUrlSlug ? "" : apiSection.urlSlug;

    const resolveSubpackageById = useCallback(
        (subpackageId: APIV1Read.SubpackageId): APIV1Read.ApiDefinitionSubpackage | undefined => {
            return resolveSubpackage(apiDefinition, subpackageId);
        },
        [apiDefinition]
    );

    const resolveTypeById = useCallback(
        (typeId: APIV1Read.TypeId): APIV1Read.TypeDefinition | undefined => {
            const type = apiDefinition?.types[typeId];
            if (type == null) {
                // eslint-disable-next-line no-console
                console.error("Type does not exist", typeId, "in apiDefinitionId", apiDefinition?.id);
            }
            return type;
        },
        [apiDefinition]
    );

    return (
        <ApiDefinitionContext.Provider
            value={{
                apiDefinition,
                apiSection,
                apiSlug,
                resolveTypeById,
                resolveSubpackageById,
            }}
        >
            {children}
        </ApiDefinitionContext.Provider>
    );
};

export function resolveSubpackage(
    apiDefinition: APIV1Read.ApiDefinition | undefined,
    subpackageId: APIV1Read.SubpackageId
): APIV1Read.ApiDefinitionSubpackage | undefined {
    const subpackage = apiDefinition?.subpackages[subpackageId];
    if (subpackage == null) {
        // eslint-disable-next-line no-console
        console.error("Subpackage does not exist", subpackageId);
    }
    if (subpackage?.pointsTo != null) {
        const resolvedSubpackage = resolveSubpackage(apiDefinition, subpackage.pointsTo);
        if (resolvedSubpackage != null) {
            return {
                ...resolvedSubpackage,
                name: subpackage.name,
                urlSlug: subpackage.urlSlug,
            };
        }
    } else {
        return subpackage;
    }
    return undefined;
}
