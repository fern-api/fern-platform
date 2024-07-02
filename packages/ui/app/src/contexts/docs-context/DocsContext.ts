import { Algolia, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { ColorsConfig } from "@fern-ui/fdr-utils";
import React from "react";
import { DocsPage } from "../../next-app/DocsPage";

export const DocsContext = React.createContext<DocsContextValue>({
    domain: "app.buildwithfern.com",
    basePath: undefined,
    layout: undefined,
    colors: {
        dark: undefined,
        light: undefined,
    },
    typography: undefined,
    css: undefined,
    files: {},
    resolveFile: () => undefined,
    currentTabIndex: undefined,
    tabs: [],
    currentVersionId: undefined,
    versions: [],
    searchInfo: undefined,
    navbarLinks: [],
    apis: [],
});

export interface DocsContextValue extends Omit<DocsPage.Navigation, "sidebar"> {
    domain: string;
    basePath: string | undefined;
    layout: DocsV1Read.DocsLayoutConfig | undefined;
    colors: ColorsConfig;
    typography: DocsV1Read.DocsTypographyConfigV2 | undefined;
    css: DocsV1Read.CssConfig | undefined;
    files: Record<DocsV1Read.FileId, DocsV1Read.File_>;
    searchInfo: Algolia.SearchInfo | undefined;
    navbarLinks: DocsV1Read.NavbarLink[];
    apis: FdrAPI.ApiDefinitionId[];

    resolveFile: (fileId: DocsV1Read.FileId) => DocsV1Read.File_ | undefined;
}
