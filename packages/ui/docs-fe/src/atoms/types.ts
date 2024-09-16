import type { DocsV1Read, DocsV2Read, FdrAPI } from "@fern-api/fdr-sdk/client/types";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ColorsConfig, SidebarTab, SidebarVersionInfo } from "@fern-platform/fdr-utils";
import { NextSeoProps } from "@fern-ui/next-seo";
import { CustomerAnalytics } from "../analytics/types";
import { FernUser } from "../auth";
import type { BundledMDX } from "../mdx/types";
import { DocsContent } from "../resolver/DocsContent";
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
    isAiChatbotEnabledInPreview: boolean;
    isAudioFileDownloadSpanSummary: boolean;
    isDocsLogoTextEnabled: boolean;
    isAudioExampleInternal: boolean;
    usesApplicationJsonInFormDataValue: boolean;
    isBinaryOctetStreamAudioPlayer: boolean;
    hasVoiceIdPlaygroundForm: boolean;
    isCohereTheme: boolean;
    isFileForgeHackEnabled: boolean;
    is404PageHidden: boolean;
}

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
