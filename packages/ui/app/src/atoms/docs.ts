import { FernNavigation } from "@fern-api/fdr-sdk";
import { atom, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { isEqual } from "lodash-es";
import { DocsPage } from "../next-app/DocsPage";
import { DEFAULT_FEATURE_FLAGS, FeatureFlags } from "./flags";

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

export const FEATURE_FLAGS_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.featureFlags, isEqual);

export function useFeatureFlags(): FeatureFlags {
    return useAtomValue(FEATURE_FLAGS_ATOM);
}
