import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import { createStore, Provider as JotaiProvider } from "jotai";
import type { AppProps } from "next/app";
import PageLoader from "next/dist/client/page-loader";
import { Router } from "next/router";
import { ReactElement, useEffect } from "react";
import { initializeDatadog } from "../analytics/datadog";
import { initializePosthog } from "../analytics/posthog";
import { DocsContextProvider } from "../contexts/docs-context/DocsContextProvider";
import { FeatureFlagContext } from "../contexts/FeatureFlagContext";
import { NavigationContextProvider } from "../contexts/navigation-context/NavigationContextProvider";
import { ViewportContextProvider } from "../contexts/viewport-context/ViewportContextProvider";
import { NextNProgress } from "../docs/NProgress";
import { ThemeProvider } from "../docs/ThemeProvider";
import { DocsPage } from "./DocsPage";
import "./globals.scss";

const store = createStore();

function withDefaultContexts(children: ReactElement): ReactElement {
    return (
        <JotaiProvider store={store}>
            <ViewportContextProvider>
                <NextNProgress options={{ showSpinner: false, speed: 400 }} showOnShallow={false} />
                {children}
            </ViewportContextProvider>
        </JotaiProvider>
    );
}

export function NextApp({ Component, pageProps, router }: AppProps<DocsPage.Props>): ReactElement {
    const files = useDeepCompareMemoize(pageProps.files);
    const layout = useDeepCompareMemoize(pageProps.layout);
    const colors = useDeepCompareMemoize(pageProps.colors);
    const typography = useDeepCompareMemoize(pageProps.typography);
    const css = useDeepCompareMemoize(pageProps.css);
    const baseUrl = useDeepCompareMemoize(pageProps.baseUrl);
    const navigation = useDeepCompareMemoize(pageProps.navigation);
    const featureFlags = useDeepCompareMemoize(pageProps.featureFlags);

    // we're memoizing the props to avoid re-rendering the entire app when the props change
    const newPageProps: DocsPage.Props = {
        ...pageProps,
        files,
        layout,
        colors,
        typography,
        css,
        baseUrl,
        navigation,
        featureFlags,
    };

    useEffect(() => {
        initializePosthog();
        if (!router.isPreview) {
            initializeDatadog();
        }
    }, [router.isPreview]);

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
        return withDefaultContexts(<Component {...newPageProps} />);
    }

    return withDefaultContexts(
        <FeatureFlagContext.Provider value={featureFlags}>
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
                        resolvedPath={pageProps.resolvedPath} // this changes between pages
                        navigation={navigation}
                        domain={baseUrl.domain}
                        basePath={baseUrl.basePath}
                        title={pageProps.title}
                    >
                        <Component {...newPageProps} />
                    </NavigationContextProvider>
                </DocsContextProvider>
            </ThemeProvider>
        </FeatureFlagContext.Provider>,
    );
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
