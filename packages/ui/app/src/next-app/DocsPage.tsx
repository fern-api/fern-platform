import { CustomerAnalytics } from "@/analytics/types";
import { DOCS_ATOM, FeatureFlags, useMessageHandler } from "@/atoms";
import { JavascriptProvider } from "@/contexts/docs-context/DocsContextProvider";
import { Algolia, DocsV1Read, DocsV2Read, FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import type { ColorsConfig, SidebarTab, SidebarVersionInfo } from "@fern-ui/fdr-utils";
import { type NextSeoProps } from "@fern-ui/next-seo";
import { useHydrateAtoms } from "jotai/utils";
import { Redirect } from "next";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { PlaygroundContextProvider } from "../api-playground/PlaygroundContext";
import { FernUser } from "../auth";
import { NavigationContextProvider } from "../contexts/navigation-context/NavigationContextProvider";
import { BgImageGradient } from "../docs/BgImageGradient";
import { useConsoleMessage } from "../hooks/useConsoleMessage";
import { type ResolvedPath } from "../resolver/ResolvedPath";
import { NextSeo } from "../seo/NextSeo";
import { InitializeTheme } from "../themes";
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
        baseUrl: DocsV2Read.BaseUrl;
        navigation: Navigation;
        title: string | undefined;
        favicon: string | undefined;
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
    const { baseUrl } = pageProps;

    useHydrateAtoms([[DOCS_ATOM, pageProps]], { dangerouslyForceHydrate: true });
    useConsoleMessage();
    useMessageHandler();

    return (
        <>
            <NextSeo />
            <InitializeTheme />
            <SearchDialog />
            <BgImageGradient />
            <NavigationContextProvider basePath={baseUrl.basePath}>
                <PlaygroundContextProvider>
                    <ThemedDocs theme={pageProps.theme} />
                </PlaygroundContextProvider>
            </NavigationContextProvider>
            <JavascriptProvider />
        </>
    );
}

export type DocsPageResult<Props> =
    | { type: "props"; props: Props; revalidate?: number | boolean }
    | { type: "redirect"; redirect: Redirect; revalidate?: number | boolean }
    | { type: "notFound"; notFound: true; revalidate?: number | boolean };
