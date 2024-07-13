import { DocsV1Read } from "@fern-api/fdr-sdk";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import Script from "next/script";
import { PropsWithChildren, useCallback, useMemo } from "react";
import { CustomerAnalytics } from "../../analytics/CustomerAnalytics";
import { renderSegmentSnippet } from "../../analytics/segment";
import { DocsPage } from "../../next-app/DocsPage";
import { renderThemeStylesheet } from "../../next-app/utils/renderThemeStylesheet";
import { DocsContext } from "./DocsContext";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<DocsPage.Props>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({ children, ...pageProps }) => {
    const files = useDeepCompareMemoize(pageProps.files);
    const colors = useDeepCompareMemoize(pageProps.colors);
    const typography = useDeepCompareMemoize(pageProps.typography);
    const css = useDeepCompareMemoize(pageProps.css);
    const js = useDeepCompareMemoize(pageProps.js);
    const searchInfo = useDeepCompareMemoize(pageProps.search);
    const navbarLinks = useDeepCompareMemoize(pageProps.navbarLinks);
    const apis = useDeepCompareMemoize(pageProps.apis);
    const analytics = useDeepCompareMemoize(pageProps.analytics);

    const { logoHeight, logoHref } = pageProps;
    const { domain, basePath } = pageProps.baseUrl;

    const layout = useDeepCompareMemoize(pageProps.layout);
    const stylesheet = useMemo(
        () => renderThemeStylesheet(colors, typography, layout, css, files, pageProps.navigation.tabs.length > 0),
        [colors, css, files, layout, pageProps.navigation.tabs.length, typography],
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
            logoHeight,
            logoHref,
            domain,
            basePath,
            colors,
            typography,
            css,
            files,
            resolveFile,
            searchInfo,
            navbarLinks,
            apis,
        }),
        [
            logoHeight,
            logoHref,
            domain,
            basePath,
            colors,
            typography,
            css,
            files,
            resolveFile,
            searchInfo,
            navbarLinks,
            apis,
        ],
    );

    return (
        <DocsContext.Provider value={value}>
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
            <CustomerAnalytics {...analytics} />
        </DocsContext.Provider>
    );
};
