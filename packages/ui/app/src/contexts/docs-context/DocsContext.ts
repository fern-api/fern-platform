import { Algolia, DocsV1Read, FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { ColorsConfig } from "@fern-ui/fdr-utils";
import React from "react";
import { DocsPage, PartnerLogin } from "../../next-app/DocsPage";

const MOCK_SIDEBAR_NODE: FernNavigation.SidebarRootNode = {
    id: FernNavigation.NodeId("root"),
    type: "sidebarRoot",
    children: [],
};

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
    sidebar: MOCK_SIDEBAR_NODE,
    nodes: NodeCollector.collect(MOCK_SIDEBAR_NODE),
    searchInfo: undefined,
    navbarLinks: [],
    apis: [],
    partnerLogin: undefined,
});

export interface DocsContextValue extends DocsPage.Navigation {
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
    nodes: NodeCollector;
    partnerLogin: PartnerLogin | undefined;

    resolveFile: (fileId: DocsV1Read.FileId) => DocsV1Read.File_ | undefined;
}
