import { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import { Toaster } from "@fern-ui/components";
import type { ColorsConfig, SidebarNavigation } from "@fern-ui/fdr-utils";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import { Redirect } from "next";
import { ReactElement } from "react";
import { FeatureFlagContext, FeatureFlags } from "../contexts/FeatureFlagContext";
import { DocsContextProvider } from "../contexts/docs-context/DocsContextProvider";
import { NavigationContextProvider } from "../contexts/navigation-context/NavigationContextProvider";
import { BgImageGradient } from "../docs/BgImageGradient";
import { Docs, SearchDialog } from "../docs/Docs";
import { type ResolvedPath } from "../resolver/ResolvedPath";

export declare namespace DocsPage {
    export interface Props {
        // docs: DocsV2Read.LoadDocsForUrlResponse;
        baseUrl: DocsV2Read.BaseUrl;
        navigation: SidebarNavigation;

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

        search: DocsV1Read.SearchInfo;
        files: Record<DocsV1Read.FileId, DocsV1Read.File_>;
        resolvedPath: ResolvedPath;

        featureFlags: FeatureFlags;
    }
}

export function DocsPage(pageProps: DocsPage.Props): ReactElement | null {
    const featureFlags = useDeepCompareMemoize(pageProps.featureFlags);

    const { baseUrl, title, layout, logoHeight, logoHref, resolvedPath } = pageProps;

    return (
        <FeatureFlagContext.Provider value={featureFlags}>
            <DocsContextProvider {...pageProps}>
                <BgImageGradient />
                <NavigationContextProvider
                    resolvedPath={resolvedPath} // this changes between pages
                    domain={baseUrl.domain}
                    basePath={baseUrl.basePath}
                    title={title}
                >
                    <SearchDialog fromHeader={layout?.searchbarPlacement === "HEADER"} />
                    <Docs logoHeight={logoHeight} logoHref={logoHref} />
                </NavigationContextProvider>
            </DocsContextProvider>
            <Toaster />
        </FeatureFlagContext.Provider>
    );
}

export type DocsPageResult<Props> =
    | { type: "props"; props: Props; revalidate?: number | boolean }
    | { type: "redirect"; redirect: Redirect; revalidate?: number | boolean }
    | { type: "notFound"; notFound: true; revalidate?: number | boolean };
