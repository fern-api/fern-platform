import { Algolia, DocsV1Read, DocsV2Read, FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import type { ColorsConfig, SidebarTab, SidebarVersionInfo } from "@fern-ui/fdr-utils";
import type { DefaultSeoProps, JsonLd } from "@fern-ui/next-seo";
import { useHydrateAtoms } from "jotai/utils";
import { Redirect } from "next";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { CustomerAnalytics } from "../analytics/types";
import { PlaygroundContextProvider } from "../api-playground/PlaygroundContext";
import { FeatureFlags } from "../atoms/flags";
import { SLUG_ATOM } from "../atoms/location";
import { RESOLVED_PATH_ATOM } from "../atoms/navigation";
import { useMessageHandler } from "../atoms/sidebar";
import { DocsContextProvider } from "../contexts/docs-context/DocsContextProvider";
import { NavigationContextProvider } from "../contexts/navigation-context/NavigationContextProvider";
import { BgImageGradient } from "../docs/BgImageGradient";
import { useConsoleMessage } from "../hooks/useConsoleMessage";
import { type ResolvedPath } from "../resolver/ResolvedPath";
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

        seo: DefaultSeoProps;
        breadcrumb: JsonLd.BreadcrumbListSchema | undefined;
        analytics: CustomerAnalytics | undefined;

        fallback: Record<string, any>;
        theme: FernTheme;
    }
}

export function DocsPage(pageProps: DocsPage.Props): ReactElement | null {
    const { baseUrl, layout, resolvedPath } = pageProps;

    useConsoleMessage();
    useMessageHandler();
    useHydrateAtoms(
        [
            [RESOLVED_PATH_ATOM, resolvedPath],
            [SLUG_ATOM, FernNavigation.Slug(resolvedPath.fullSlug)],
        ],
        { dangerouslyForceHydrate: true },
    );

    return (
        <DocsContextProvider {...pageProps}>
            <BgImageGradient />
            <NavigationContextProvider domain={baseUrl.domain} basePath={baseUrl.basePath}>
                <SearchDialog fromHeader={layout?.searchbarPlacement === "HEADER"} />
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
