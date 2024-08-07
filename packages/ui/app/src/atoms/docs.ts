import { FernNavigation } from "@fern-api/fdr-sdk";
import { atomWithReducer } from "jotai/utils";
import { DocsProps, FeatureFlags } from "./types";

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
};

const EMPTY_DOCS_STATE: DocsProps = {
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
    },
    title: undefined,
    favicon: undefined,
    colors: {
        light: undefined,
        dark: undefined,
    },
    layout: undefined,
    typography: undefined,
    css: undefined,
    js: undefined,
    navbarLinks: [],
    logoHeight: undefined,
    logoHref: undefined,
    files: {},
    resolvedPath: {
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
    fallback: {},
    theme: "default",
    user: undefined,
    defaultLang: "curl",
};

export const DOCS_ATOM = atomWithReducer<DocsProps, DocsProps>(EMPTY_DOCS_STATE, (_, next) => {
    if (next == null || next.baseUrl == null) {
        return EMPTY_DOCS_STATE;
    }
    return next;
});
DOCS_ATOM.debugLabel = "DOCS_ATOM";
