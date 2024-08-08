import type { DocsV1Read, DocsV2Read, FdrAPI, FernNavigation } from "@fern-api/fdr-sdk/client/types";
import { ColorsConfig, SidebarTab, SidebarVersionInfo } from "@fern-ui/fdr-utils";
import { NextSeoProps } from "@fern-ui/next-seo";
import { CustomerAnalytics } from "../analytics/types";
import { FernUser } from "../auth";
import { ResolvedPath } from "../resolver/ResolvedPath";
import { FernTheme } from "../themes/ThemedDocs";

export interface FeatureFlags {
    isApiPlaygroundEnabled: boolean;
    isApiScrollingDisabled: boolean;
    isWhitelabeled: boolean;
    isSeoDisabled: boolean;
    isTocDefaultEnabled: boolean;
    isSnippetTemplatesEnabled: boolean;
    isHttpSnippetsEnabled: boolean;
    isInlineFeedbackEnabled: boolean;
    isDarkCodeEnabled: boolean;
    proxyShouldUseAppBuildwithfernCom: boolean;
    isImageZoomDisabled: boolean;
    useJavaScriptAsTypeScript: boolean;
    alwaysEnableJavaScriptFetch: boolean;
    scrollInContainerEnabled: boolean;
    useMdxBundler: boolean;
    isBatchStreamToggleDisabled: boolean;
    isAuthEnabledInDocs: boolean;
}

export interface NavigationProps {
    currentTabIndex: number | undefined;
    tabs: SidebarTab[];
    currentVersionId: FernNavigation.VersionId | undefined;
    versions: SidebarVersionInfo[];
    sidebar: FernNavigation.SidebarRootNode | undefined;
}

export interface DocsProps {
    baseUrl: DocsV2Read.BaseUrl;
    navigation: NavigationProps;
    title: string | undefined;
    favicon: string | undefined;
    colors: ColorsConfig;
    layout: DocsV1Read.DocsLayoutConfig | undefined;
    js: DocsV1Read.JsConfig | undefined;
    navbarLinks: DocsV1Read.NavbarLink[];
    logoHeight: DocsV1Read.Height | undefined;
    logoHref: DocsV1Read.Url | undefined;
    files: Record<DocsV1Read.FileId, DocsV1Read.File_>;
    resolvedPath: ResolvedPath;
    featureFlags: FeatureFlags;
    apis: FdrAPI.ApiDefinitionId[];
    seo: NextSeoProps;
    analytics: CustomerAnalytics | undefined;
    fallback: Record<string, any>;
    theme: FernTheme;
    user: FernUser | undefined;
    defaultLang: DocsV1Read.ProgrammingLanguage;
    stylesheet: string;
}
