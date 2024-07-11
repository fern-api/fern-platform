import { Algolia, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import React from "react";

export const DocsContext = React.createContext<DocsContextValue>({
    logoHeight: undefined,
    logoHref: undefined,
    typography: undefined,
    css: undefined,
    files: {},
    resolveFile: () => undefined,
    searchInfo: undefined,
    navbarLinks: [],
    apis: [],
});

export interface DocsContextValue {
    logoHeight: DocsV1Read.Height | undefined;
    logoHref: DocsV1Read.Url | undefined;
    typography: DocsV1Read.DocsTypographyConfigV2 | undefined;
    css: DocsV1Read.CssConfig | undefined;
    files: Record<DocsV1Read.FileId, DocsV1Read.File_>;
    searchInfo: Algolia.SearchInfo | undefined;
    navbarLinks: DocsV1Read.NavbarLink[];
    apis: FdrAPI.ApiDefinitionId[];

    resolveFile: (fileId: DocsV1Read.FileId) => DocsV1Read.File_ | undefined;
}
