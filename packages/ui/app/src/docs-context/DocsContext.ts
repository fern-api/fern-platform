import { DocsDefinitionSummary, DocsV1Read, PathResolver } from "@fern-api/fdr-sdk";
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
    config: EMPTY_DEFINITION.config,
    pathResolver: new PathResolver({ definition: EMPTY_DEFINITION_SUMMARY }),
    resolveFile: () => undefined,
});

export interface DocsContextValue {
    domain: string;
    basePath: string | undefined;
    pathResolver: PathResolver;
    config: DocsV1Read.DocsConfig;

    resolveFile: (fileId: DocsV1Read.FileId) => DocsV1Read.File_ | undefined;
}
