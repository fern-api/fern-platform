import { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import { useTheme } from "next-themes";
import Head from "next/head";
import Script from "next/script";
import { PropsWithChildren, ReactNode, useCallback, useMemo } from "react";
import { renderSegmentSnippet } from "../../analytics/segment";
import { CustomerIntegrations } from "../../integrations/CustomerIntegrations";
import { DocsPage } from "../../next-app/DocsPage";
import { getThemeColor } from "../../next-app/utils/getColorVariables";
import { getFontExtension } from "../../next-app/utils/getFontVariables";
import { renderThemeStylesheet } from "../../next-app/utils/renderThemeStylesheet";
import { DocsContext } from "./DocsContext";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<DocsPage.Props>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({ children, ...pageProps }) => {
    const files = useDeepCompareMemoize(pageProps.files);
    const layout = useDeepCompareMemoize(pageProps.layout);
    const colors = useDeepCompareMemoize(pageProps.colors);
    const typography = useDeepCompareMemoize(pageProps.typography);
    const css = useDeepCompareMemoize(pageProps.css);
    const js = useDeepCompareMemoize(pageProps.js);
    const sidebarNodes = useDeepCompareMemoize(pageProps.navigation.sidebarNodes);
    const tabs = useDeepCompareMemoize(pageProps.navigation.tabs);
    const versions = useDeepCompareMemoize(pageProps.navigation.versions);
    const searchInfo = useDeepCompareMemoize(pageProps.search);
    const navbarLinks = useDeepCompareMemoize(pageProps.navbarLinks);
    const integrations = useDeepCompareMemoize(pageProps.integrations);
    const { resolvedTheme: theme } = useTheme();

    const { baseUrl, title, favicon } = pageProps;
    const { currentTabIndex, currentVersionIndex } = pageProps.navigation;

    const stylesheet = useMemo(
        () => renderThemeStylesheet(colors, typography, layout, css, files, tabs.length > 0),
        [colors, css, files, layout, tabs.length, typography],
    );

    const resolveFile = useCallback(
        (fileId: DocsV1Read.FileId): DocsV1Read.File_ | undefined => {
            const file = files[fileId];
            if (file == null) {
                // eslint-disable-next-line no-console
                console.error("File does not exist", fileId);
            }
            return file;
        },
        [files],
    );

    const value = useMemo(
        () => ({
            domain: baseUrl.domain,
            basePath: baseUrl.basePath,
            layout,
            colors,
            typography,
            css,
            files,
            resolveFile,
            currentTabIndex,
            tabs,
            currentVersionIndex,
            versions,
            sidebarNodes,
            searchInfo,
            navbarLinks,
        }),
        [
            baseUrl.basePath,
            baseUrl.domain,
            colors,
            css,
            currentTabIndex,
            currentVersionIndex,
            files,
            layout,
            resolveFile,
            sidebarNodes,
            tabs,
            typography,
            versions,
            searchInfo,
            navbarLinks,
        ],
    );

    return (
        <DocsContext.Provider value={value}>
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
                {maybeRenderNoIndex(baseUrl)}
            </Head>
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

            {children}

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
            <Script id="segment-script" dangerouslySetInnerHTML={{ __html: renderSegmentSnippet(baseUrl.domain) }} />
            <CustomerIntegrations domain={baseUrl.domain} integrations={integrations} />
        </DocsContext.Provider>
    );
};

function getPreloadedFont(
    variant: DocsV1Read.CustomFontConfigVariant,
    files: Record<DocsV1Read.FileId, DocsV1Read.File_>,
) {
    const file = files[variant.fontFile]?.url;
    if (file == null) {
        return null;
    }
    let fontExtension: string;
    try {
        fontExtension = getFontExtension(new URL(file).pathname);
    } catch (err) {
        fontExtension = getFontExtension(file);
    }
    return (
        <link
            key={variant.fontFile}
            rel="preload"
            href={file}
            as="font"
            type={`font/${fontExtension}`}
            crossOrigin="anonymous"
        />
    );
}

function maybeRenderNoIndex(baseUrl: DocsV2Read.BaseUrl): ReactNode {
    // If the basePath is present, it's not clear whether or not the site is hosted on a custom domain.
    // In this case, we don't want to render the no-track script. If this changes, we should update this logic.
    if (baseUrl.basePath != null && process.env.NODE_ENV === "production") {
        return null;
    }

    if (
        baseUrl.domain.includes("docs.dev.buildwithfern.com") ||
        baseUrl.domain.includes("docs.staging.buildwithfern.com") ||
        baseUrl.domain.includes(".docs.buildwithfern.com") ||
        process.env.NODE_ENV !== "production"
    ) {
        return <meta name="robots" content="noindex, nofollow" />;
    }
    return null;
}
