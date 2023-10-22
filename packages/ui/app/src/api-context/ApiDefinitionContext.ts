import * as FernRegistryApiRead from "@fern-api/fdr-sdk/dist/generated/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-api/fdr-sdk/dist/generated/api/resources/docs/resources/v1/resources/read";
import React from "react";

export const ApiDefinitionContext = React.createContext<() => ApiDefinitionContextValue>(() => {
    throw new Error("ApiDefinitionContextProvider is not present in this tree.");
});

export interface ApiDefinitionContextValue {
    apiDefinition: FernRegistryApiRead.ApiDefinition;
    apiSection: FernRegistryDocsRead.ApiSection;
    apiSlug: string;
    resolveTypeById: (typeId: FernRegistryApiRead.TypeId) => FernRegistryApiRead.TypeDefinition;
    resolveSubpackageById: (
        subpackageId: FernRegistryApiRead.SubpackageId
    ) => FernRegistryApiRead.ApiDefinitionSubpackage;
}
