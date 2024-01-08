import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import React from "react";

export const ApiDefinitionContext = React.createContext<() => ApiDefinitionContextValue>(() => {
    throw new Error("ApiDefinitionContextProvider is not present in this tree.");
});

export interface ApiDefinitionContextValue {
    apiDefinition: APIV1Read.ApiDefinition | undefined;
    apiSection: DocsV1Read.ApiSection;
    apiSlug: string;
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined;
    resolveSubpackageById: (subpackageId: APIV1Read.SubpackageId) => APIV1Read.ApiDefinitionSubpackage | undefined;
}
