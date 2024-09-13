import { DocsV1Read, DocsV2Read, FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { ColorsConfig, SidebarTab, SidebarVersionInfo } from "@fern-ui/fdr-utils";
import { NextSeoProps } from "../../../commons/next-seo/src";
import { BundledMDX } from "../../app/src/mdx/types";
import { DocsContent } from "./DocsContent";
import { CustomerAnalytics } from "./analytics";
import { FernUser } from "./auth";
import { FeatureFlags } from "./featureFlags";

export type FernTheme = "default" | "cohere";

export interface NavigationProps {
    currentTabIndex: number | undefined;
    tabs: SidebarTab[];
    currentVersionId: FernNavigation.VersionId | undefined;
    versions: SidebarVersionInfo[];
    sidebar: FernNavigation.SidebarRootNode | undefined;
    trailingSlash: boolean;
}

export interface AnnouncementConfig {
    text: string;
    mdx: BundledMDX;
}

export interface DocsProps {
    baseUrl: DocsV2Read.BaseUrl;
    navigation: NavigationProps;
    title: string | undefined;
    favicon: string | undefined;
    colors: ColorsConfig;
    announcement: AnnouncementConfig | undefined;
    layout: DocsV1Read.DocsLayoutConfig | undefined;
    js: DocsV1Read.JsConfig | undefined;
    navbarLinks: DocsV1Read.NavbarLink[];
    logoHeight: DocsV1Read.Height | undefined;
    logoHref: DocsV1Read.Url | undefined;
    files: Record<DocsV1Read.FileId, DocsV1Read.File_>;
    content: DocsContent;
    featureFlags: FeatureFlags;
    apis: FdrAPI.ApiDefinitionId[];
    seo: NextSeoProps;
    analytics: CustomerAnalytics | undefined; // deprecated
    analyticsConfig: DocsV1Read.AnalyticsConfig | undefined;
    fallback: Record<string, any>;
    theme: FernTheme;
    user: FernUser | undefined;
    defaultLang: DocsV1Read.ProgrammingLanguage;
    stylesheet: string;
}
