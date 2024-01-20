/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { APIV1Read, DocsDefinitionSummary, DocsV1Read, FdrAPI, PathResolver } from "@fern-api/fdr-sdk";
import { DefinitionObjectFactory } from "@fern-ui/app-utils";
import React from "react";

const EMPTY_DEFINITION = DefinitionObjectFactory.createDocsDefinition();
const EMPTY_DEFINITION_SUMMARY: DocsDefinitionSummary = {
    apis: EMPTY_DEFINITION.apis,
    docsConfig: EMPTY_DEFINITION.config,
};

export const DocsContext = React.createContext<DocsContextValue>({
    domain: "app.buildwithfern.com",
    basePath: undefined,
    pathResolver: new PathResolver({ definition: EMPTY_DEFINITION_SUMMARY }),
    docsDefinition: undefined!,
    resolveApi: () => undefined,
    resolvePage: () => undefined,
    resolveFile: () => undefined,
});

export interface DocsContextValue {
    domain: string;
    basePath: string | undefined;
    docsDefinition: DocsV1Read.DocsDefinition;
    pathResolver: PathResolver;

    resolveApi: (apiId: FdrAPI.ApiDefinitionId) => APIV1Read.ApiDefinition | undefined;
    resolvePage: (pageId: DocsV1Read.PageId) => DocsV1Read.PageContent | undefined;
    resolveFile: (fileId: DocsV1Read.FileId) => DocsV1Read.Url | undefined;
}
