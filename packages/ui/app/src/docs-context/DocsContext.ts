import { DocsV1Read } from "@fern-api/fdr-sdk";
import React from "react";
import { DefinitionObjectFactory } from "../util/fern";

const EMPTY_DEFINITION = DefinitionObjectFactory.createDocsDefinition();

export const DocsContext = React.createContext<DocsContextValue>({
    domain: "app.buildwithfern.com",
    basePath: undefined,
    config: EMPTY_DEFINITION.config,
    resolveFile: () => undefined,
});

export interface DocsContextValue {
    domain: string;
    basePath: string | undefined;
    config: DocsV1Read.DocsConfig;

    resolveFile: (fileId: DocsV1Read.FileId) => DocsV1Read.File_ | undefined;
}
