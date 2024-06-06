import { DocsV1Read } from "@fern-api/fdr-sdk";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import { useTheme } from "next-themes";
import Head from "next/head";
import Script from "next/script";
import { PropsWithChildren, useCallback, useMemo } from "react";
import { CustomerAnalytics } from "../../analytics/CustomerAnalytics";
import { renderSegmentSnippet } from "../../analytics/segment";
import { DocsPage } from "../../next-app/DocsPage";
import { getThemeColor } from "../../next-app/utils/getColorVariables";
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
    const sidebar = useDeepCompareMemoize(pageProps.navigation.sidebar);
    const tabs = useDeepCompareMemoize(pageProps.navigation.tabs);
    const versions = useDeepCompareMemoize(pageProps.navigation.versions);
    const searchInfo = useDeepCompareMemoize(pageProps.search);
    const navbarLinks = useDeepCompareMemoize(pageProps.navbarLinks);
    const apis = useDeepCompareMemoize(pageProps.apis);
    const { resolvedTheme: theme } = useTheme();

    const { domain, basePath } = pageProps.baseUrl;
    const { currentTabIndex, currentVersionId } = pageProps.navigation;

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
            domain,
            basePath,
            layout,
            colors,
            typography,
            css,
            files,
            resolveFile,
            currentTabIndex,
            tabs,
            currentVersionId,
            versions,
            sidebar,
            nodes: NodeCollector.collect(sidebar),
            searchInfo,
            navbarLinks,
            apis,
        }),
        [
            domain,
            basePath,
            layout,
            colors,
            typography,
            css,
            files,
            resolveFile,
            currentTabIndex,
            tabs,
            currentVersionId,
            versions,
            sidebar,
            searchInfo,
            navbarLinks,
            apis,
        ],
    );

    return (
        <DocsContext.Provider value={value}>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                />
                {theme === "light" && colors.light != null && (
                    <meta name="theme-color" content={getThemeColor(colors.light)} />
                )}
                {theme === "dark" && colors.dark != null && (
                    <meta name="theme-color" content={getThemeColor(colors.dark)} />
                )}
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
            <Script id="segment-script" dangerouslySetInnerHTML={{ __html: renderSegmentSnippet(domain) }} />
            <CustomerAnalytics domain={domain} />
        </DocsContext.Provider>
    );
};
