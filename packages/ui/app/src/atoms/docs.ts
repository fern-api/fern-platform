import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { atomWithReducer, useHydrateAtoms } from "jotai/utils";
import type { PropsWithChildren, ReactNode } from "react";
import type { DocsProps, FeatureFlags } from "./types";

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
    isApiPlaygroundEnabled: false,
    isApiScrollingDisabled: false,
    isWhitelabeled: false,
    isSeoDisabled: false,
    isTocDefaultEnabled: false,
    isSnippetTemplatesEnabled: false,
    isHttpSnippetsEnabled: false,
    isInlineFeedbackEnabled: false,
    isDarkCodeEnabled: false,
    proxyShouldUseAppBuildwithfernCom: false,
    isImageZoomDisabled: false,
    useJavaScriptAsTypeScript: false,
    alwaysEnableJavaScriptFetch: false,
    scrollInContainerEnabled: false,
    useMdxBundler: false,
    isBatchStreamToggleDisabled: false,
    isAuthEnabledInDocs: false,
    isAiChatbotEnabledInPreview: false,
    isAudioFileDownloadSpanSummary: false,
    isDocsLogoTextEnabled: false,
    isAudioExampleInternal: false,
    usesApplicationJsonInFormDataValue: false,
    isBinaryOctetStreamAudioPlayer: false,
    hasVoiceIdPlaygroundForm: false,
    isCohereTheme: false,
    isFileForgeHackEnabled: false,
    is404PageHidden: false,
};

const EMPTY_DOCS_STATE: DocsProps = {
    announcement: undefined,
    baseUrl: {
        domain: "app.buildwithfern.com",
        basePath: undefined,
    },
    navigation: {
        currentTabIndex: undefined,
        tabs: [],
        currentVersionId: undefined,
        versions: [],
        sidebar: undefined,
        trailingSlash: false,
    },
    title: undefined,
    favicon: undefined,
    colors: {
        light: undefined,
        dark: undefined,
    },
    layout: undefined,
    js: undefined,
    navbarLinks: [],
    logoHeight: undefined,
    logoHref: undefined,
    files: {},
    content: {
        type: "custom-markdown-page",
        slug: FernNavigation.Slug(""),
        title: "",
        mdx: "",
        neighbors: { prev: null, next: null },
        apis: {},
    },
    featureFlags: DEFAULT_FEATURE_FLAGS,
    apis: [],
    seo: {},
    analytics: undefined,
    analyticsConfig: {},
    fallback: {},
    theme: "default",
    user: undefined,
    defaultLang: "curl",
    stylesheet: "",
};

export const DOCS_ATOM = atomWithReducer<DocsProps, DocsProps>(EMPTY_DOCS_STATE, (_, next) => {
    if (next == null || next.baseUrl == null) {
        return EMPTY_DOCS_STATE;
    }
    return next;
});
DOCS_ATOM.debugLabel = "DOCS_ATOM";

export function HydrateAtoms({
    pageProps,
    children,
}: PropsWithChildren<{ pageProps: DocsProps | undefined }>): ReactNode {
    useHydrateAtoms(new Map([[DOCS_ATOM, pageProps]]), { dangerouslyForceHydrate: true });
    return children;
}
