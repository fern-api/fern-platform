import { DocsV1Read } from "@fern-api/fdr-sdk";
import React from "react";

export const DocsContext = React.createContext<DocsContextValue>({
    domain: "app.buildwithfern.com",
    basePath: undefined,
    layout: undefined,
    resolveFile: () => undefined,
});

export interface DocsContextValue {
    domain: string;
    basePath: string | undefined;
    layout: DocsV1Read.DocsLayoutConfig | undefined;

    resolveFile: (fileId: DocsV1Read.FileId) => DocsV1Read.File_ | undefined;
}
