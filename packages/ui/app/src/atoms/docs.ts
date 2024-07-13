import { DocsPage } from "@/next-app/DocsPage";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { atom } from "jotai";
import { DEFAULT_FEATURE_FLAGS } from "./flags";

export const DOCS_ATOM = atom<DocsPage.Props>({
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
    search: {
        type: "legacyMultiAlgoliaIndex",
    },
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
} satisfies DocsPage.Props);
