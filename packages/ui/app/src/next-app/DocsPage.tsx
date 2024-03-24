import { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import type { ColorsConfig, SidebarNavigation } from "@fern-ui/fdr-utils";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import { Redirect } from "next";
import { useTheme } from "next-themes";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { ReactElement, useMemo } from "react";
import { DocsContextProvider } from "../contexts/docs-context/DocsContextProvider";
import { FeatureFlagContext, FeatureFlags } from "../contexts/FeatureFlagContext";
import { NavigationContextProvider } from "../contexts/navigation-context/NavigationContextProvider";
import { BgImageGradient } from "../docs/BgImageGradient";
import { Docs, SearchDialog } from "../docs/Docs";
import { type ResolvedPath } from "../util/ResolvedPath";
import { getThemeColor } from "./utils/getColorVariables";
import { getFontExtension } from "./utils/getFontVariables";
import { renderThemeStylesheet } from "./utils/renderThemeStylesheet";

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
        algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | undefined;
        files: Record<DocsV1Read.FileId, DocsV1Read.File_>;
        resolvedPath: ResolvedPath;

        featureFlags: FeatureFlags;
    }
}

export function DocsPage(pageProps: DocsPage.Props): ReactElement | null {
    const router = useRouter();
    const files = useDeepCompareMemoize(pageProps.files);
    const layout = useDeepCompareMemoize(pageProps.layout);
    const colors = useDeepCompareMemoize(pageProps.colors);
    const typography = useDeepCompareMemoize(pageProps.typography);
    const css = useDeepCompareMemoize(pageProps.css);
    const js = useDeepCompareMemoize(pageProps.js);
    const navbarLinks = useDeepCompareMemoize(pageProps.navbarLinks);
    const baseUrl = useDeepCompareMemoize(pageProps.baseUrl);
    const navigation = useDeepCompareMemoize(pageProps.navigation);
    const featureFlags = useDeepCompareMemoize(pageProps.featureFlags);
    const search = useDeepCompareMemoize(pageProps.search);
    const { resolvedTheme: theme } = useTheme();

    const { title, favicon, logoHeight, logoHref, algoliaSearchIndex, resolvedPath } = pageProps;

    const stylesheet = useMemo(
        () => renderThemeStylesheet(colors, typography, layout, css, files),
        [colors, css, files, layout, typography],
    );

    if (baseUrl == null) {
        // eslint-disable-next-line no-console
        console.error("Fern Docs crashed. Reloading the page might fix the issue.");
        router.reload();
        return null;
    }

    return (
        <FeatureFlagContext.Provider value={featureFlags}>
            {/* 
                    We concatenate all global styles into a single instance,
                    as styled JSX will only create one instance of global styles
                    for each component.
                */}
            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx global>
                {`
                    ${stylesheet}
                `}
            </style>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                />
                {title != null && <title>{title}</title>}
                {favicon != null && <link rel="icon" id="favicon" href={files[favicon]?.url} />}
                {typography?.bodyFont?.variants.map((v) => getPreloadedFont(v, files))}
                {typography?.headingsFont?.variants.map((v) => getPreloadedFont(v, files))}
                {typography?.codeFont?.variants.map((v) => getPreloadedFont(v, files))}
                {theme === "light" && colors.light != null && (
                    <meta name="theme-color" content={getThemeColor(colors.light)} />
                )}
                {theme === "dark" && colors.dark != null && (
                    <meta name="theme-color" content={getThemeColor(colors.dark)} />
                )}
            </Head>
            <div className="min-h-screen w-full">
                <BgImageGradient colors={colors} />
                <DocsContextProvider
                    files={files}
                    layout={layout}
                    baseUrl={baseUrl}
                    colors={colors}
                    typography={typography}
                    css={css}
                >
                    <NavigationContextProvider
                        resolvedPath={resolvedPath} // this changes between pages
                        navigation={navigation}
                        domain={baseUrl.domain}
                        basePath={baseUrl.basePath}
                        title={title}
                    >
                        <SearchDialog fromHeader={layout?.searchbarPlacement === "HEADER"} />
                        <Docs
                            logoHeight={logoHeight}
                            logoHref={logoHref}
                            navbarLinks={navbarLinks}
                            search={search}
                            algoliaSearchIndex={algoliaSearchIndex}
                        />
                    </NavigationContextProvider>
                </DocsContextProvider>
            </div>
            {js?.inline?.map((inline, idx) => (
                <Script key={`inline-script-${idx}`} id={`inline-script-${idx}`}>
                    {inline}
                </Script>
            ))}
            {js?.files.map((file) => (
                <Script
                    key={file.fileId}
                    src={files[file.fileId]?.url}
                    strategy={file.strategy}
                    type="module"
                    crossOrigin="anonymous"
                />
            ))}
            {js?.remote?.map((remote) => <Script key={remote.url} src={remote.url} strategy={remote.strategy} />)}
        </FeatureFlagContext.Provider>
    );
}

function getPreloadedFont(
    variant: DocsV1Read.CustomFontConfigVariant,
    files: Record<DocsV1Read.FileId, DocsV1Read.File_>,
) {
    const file = files[variant.fontFile]?.url;
    if (file == null) {
        return null;
    }
    return (
        <link
            key={variant.fontFile}
            rel="preload"
            href={file}
            as="font"
            type={`font/${getFontExtension(new URL(file).pathname)}`}
            crossOrigin="anonymous"
        />
    );
}

export type DocsPageResult<Props> =
    | { type: "props"; props: Props; revalidate?: number | boolean }
    | { type: "redirect"; redirect: Redirect; revalidate?: number | boolean }
    | { type: "notFound"; notFound: true; revalidate?: number | boolean };
