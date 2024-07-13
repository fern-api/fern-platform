import {
    COLORS_ATOM,
    DOCS_LAYOUT_ATOM,
    FEATURE_FLAGS_ATOM,
    FERN_USER_ATOM,
    FeatureFlags,
    LOGO_TEXT_ATOM,
    SETTABLE_NEXT_SEO_ATOM,
    SLUG_ATOM,
    useMessageHandler,
} from "@/atoms";
import { Algolia, DocsV1Read, DocsV2Read, FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import type { ColorsConfig, SidebarTab, SidebarVersionInfo } from "@fern-ui/fdr-utils";
import { type NextSeoProps } from "@fern-ui/next-seo";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import { useHydrateAtoms } from "jotai/utils";
import { Redirect } from "next";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { CustomerAnalytics } from "../analytics/types";
import { PlaygroundContextProvider } from "../api-playground/PlaygroundContext";
import {
    BASEPATH_ATOM,
    CURRENT_TAB_INDEX_ATOM,
    CURRENT_VERSION_ID_ATOM,
    DOMAIN_ATOM,
    RESOLVED_PATH_ATOM,
    SIDEBAR_ROOT_NODE_ATOM,
    TABS_ATOM,
    VERSIONS_ATOM,
} from "../atoms/navigation";
import { FernUser } from "../auth";
import { DocsContextProvider } from "../contexts/docs-context/DocsContextProvider";
import { NavigationContextProvider } from "../contexts/navigation-context/NavigationContextProvider";
import { BgImageGradient } from "../docs/BgImageGradient";
import { useConsoleMessage } from "../hooks/useConsoleMessage";
import { type ResolvedPath } from "../resolver/ResolvedPath";
import { NextSeo } from "../seo/NextSeo";
import { InitializeTheme } from "../themes/InitializeTheme";
import { ThemedDocs, type FernTheme } from "../themes/ThemedDocs";

const SearchDialog = dynamic(() => import("../search/SearchDialog").then(({ SearchDialog }) => SearchDialog), {
    ssr: true,
});

export declare namespace DocsPage {
    export interface Navigation {
        currentTabIndex: number | undefined;
        tabs: SidebarTab[];
        currentVersionId: FernNavigation.VersionId | undefined;
        versions: SidebarVersionInfo[];
        sidebar: FernNavigation.SidebarRootNode | undefined;
    }

    export interface Props {
        // docs: DocsV2Read.LoadDocsForUrlResponse;
        baseUrl: DocsV2Read.BaseUrl;
        navigation: Navigation;

        title: string | undefined;
        favicon: string | undefined;
        // backgroundImage: string | undefined;
        colors: ColorsConfig;
        layout: DocsV1Read.DocsLayoutConfig | undefined;
        typography: DocsV1Read.DocsTypographyConfigV2 | undefined;
        css: DocsV1Read.CssConfig | undefined;
        js: DocsV1Read.JsConfig | undefined;
        navbarLinks: DocsV1Read.NavbarLink[];
        logoHeight: DocsV1Read.Height | undefined;
        logoHref: DocsV1Read.Url | undefined;

        search: Algolia.SearchInfo;
        files: Record<DocsV1Read.FileId, DocsV1Read.File_>;
        resolvedPath: ResolvedPath;

        featureFlags: FeatureFlags;
        apis: FdrAPI.ApiDefinitionId[];

        seo: NextSeoProps;
        analytics: CustomerAnalytics | undefined;

        fallback: Record<string, any>;
        theme: FernTheme;

        user: FernUser | undefined;
    }
}

export function DocsPage(pageProps: DocsPage.Props): ReactElement | null {
    const { baseUrl, resolvedPath } = pageProps;

    // Note: only hydrate atoms here.
    useHydrateAtoms(
        [
            [DOMAIN_ATOM, baseUrl?.domain],
            [BASEPATH_ATOM, baseUrl?.basePath],
            [RESOLVED_PATH_ATOM, resolvedPath],
            [SLUG_ATOM, FernNavigation.Slug(resolvedPath?.slug)],
            [COLORS_ATOM, useDeepCompareMemoize(pageProps.colors)],
            [DOCS_LAYOUT_ATOM, useDeepCompareMemoize(pageProps.layout)],
            [SIDEBAR_ROOT_NODE_ATOM, useDeepCompareMemoize(pageProps.navigation.sidebar)],
            [FEATURE_FLAGS_ATOM, useDeepCompareMemoize(pageProps.featureFlags)],
            [TABS_ATOM, useDeepCompareMemoize(pageProps.navigation.tabs)],
            [VERSIONS_ATOM, useDeepCompareMemoize(pageProps.navigation.versions)],
            [CURRENT_TAB_INDEX_ATOM, pageProps.navigation.currentTabIndex],
            [CURRENT_VERSION_ID_ATOM, pageProps.navigation.currentVersionId],
            [SETTABLE_NEXT_SEO_ATOM, useDeepCompareMemoize(pageProps.seo)],

            // TODO: remove this once we have a better way to hydrate the logo text
            [LOGO_TEXT_ATOM, baseUrl.domain.includes("cohere") ? "docs" : undefined],

            // auth
            [FERN_USER_ATOM, pageProps.user],
        ],
        { dangerouslyForceHydrate: true },
    );

    useConsoleMessage();
    useMessageHandler();

    return (
        <DocsContextProvider {...pageProps}>
            <NextSeo />
            <BgImageGradient />
            <InitializeTheme />
            <SearchDialog />
            <NavigationContextProvider basePath={baseUrl.basePath}>
                <PlaygroundContextProvider>
                    <ThemedDocs theme={pageProps.theme} />
                </PlaygroundContextProvider>
            </NavigationContextProvider>
        </DocsContextProvider>
    );
}

export type DocsPageResult<Props> =
    | { type: "props"; props: Props; revalidate?: number | boolean }
    | { type: "redirect"; redirect: Redirect; revalidate?: number | boolean }
    | { type: "notFound"; notFound: true; revalidate?: number | boolean };
