import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import type { AppProps } from "next/app";
import PageLoader from "next/dist/client/page-loader";
import { Router } from "next/router";
import { ReactElement, useEffect } from "react";
import { initializePosthog } from "../analytics/posthog";
import { CONTEXTS } from "../contexts";
import { DocsContextProvider } from "../contexts/docs-context/DocsContextProvider";
import { NavigationContextProvider } from "../contexts/navigation-context/NavigationContextProvider";
import { ThemeProvider } from "../docs/ThemeProvider";
import { DocsPage } from "./DocsPage";
import "./globals.scss";

export function NextApp({ Component, pageProps, router }: AppProps<DocsPage.Props>): ReactElement {
    const files = useDeepCompareMemoize(pageProps.files);
    const layout = useDeepCompareMemoize(pageProps.layout);
    const colors = useDeepCompareMemoize(pageProps.colors);
    const typography = useDeepCompareMemoize(pageProps.typography);
    const css = useDeepCompareMemoize(pageProps.css);
    const baseUrl = useDeepCompareMemoize(pageProps.baseUrl);
    const resolvedPath = useDeepCompareMemoize(pageProps.resolvedPath);
    const navigation = useDeepCompareMemoize(pageProps.navigation);
    const title = useDeepCompareMemoize(pageProps.title);

    useEffect(() => {
        initializePosthog();
    }, []);

    const theme =
        pageProps.colors?.dark != null && pageProps.colors?.light != null
            ? "darkAndLight"
            : pageProps.colors?.dark != null
              ? "dark"
              : "light";

    useInterceptNextDataHref({
        router,
        basePath: pageProps.baseUrl?.basePath,
        host: pageProps.baseUrl?.domain,
    });

    if (pageProps.baseUrl == null) {
        return CONTEXTS.reduceRight((children, Context) => <Context>{children}</Context>, <Component {...pageProps} />);
    }

    const app = (
        <ThemeProvider theme={theme}>
            <DocsContextProvider
                files={files}
                layout={layout}
                baseUrl={baseUrl}
                colors={colors}
                typography={typography}
                css={css}
            >
                <NavigationContextProvider
                    resolvedPath={resolvedPath}
                    navigation={navigation}
                    domain={baseUrl.domain}
                    basePath={baseUrl.basePath}
                    title={title}
                >
                    <Component {...pageProps} />
                </NavigationContextProvider>
            </DocsContextProvider>
        </ThemeProvider>
    );

    return CONTEXTS.reduceRight((children, Context) => <Context>{children}</Context>, app);
}

// hack for basepath: https://github.com/vercel/next.js/discussions/25681#discussioncomment-2026813
const useInterceptNextDataHref = ({
    router,
    basePath,
    host,
}: {
    router: Router;
    basePath: string | undefined;
    host: string | undefined;
}) => {
    useEffect(() => {
        if (basePath != null && basePath !== "" && basePath !== "/" && router.pageLoader?.getDataHref) {
            const prefixedBasePath = basePath.startsWith("/") ? basePath : `/${basePath}`;
            // eslint-disable-next-line jest/unbound-method
            const originalGetDataHref = router.pageLoader.getDataHref;
            router.pageLoader.getDataHref = function (...args: Parameters<PageLoader["getDataHref"]>) {
                const r = originalGetDataHref.call(router.pageLoader, ...args);
                return r && r.startsWith("/_next/data") ? fixHost(`${prefixedBasePath}${r}`, host) : r;
            };
        }
    }, [router, basePath, host]);
};

function fixHost(path: string, host: string | undefined) {
    // path is like /_next/data/development/.../index.json?host=docs&slug=x&slug=x
    // we want to replace the host with the actual host like docs.devexpress.com
    if (host == null) {
        return path;
    }
    if (!path.includes("?") || path.includes(`?host=${host}`)) {
        return path;
    }

    // use regex to replace ?host=docs&slug=x&slug=x with ?host=docs.devexpress.com&slug=host&slug=x&slug=x
    return path.replace(/(\?host=)([^&]+)/, `$1${host}&slug=$2`);
}
