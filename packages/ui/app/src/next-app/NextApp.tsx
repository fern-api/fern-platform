import { TooltipProvider } from "@radix-ui/react-tooltip";
import { createStore, Provider as JotaiProvider } from "jotai";
import type { AppProps } from "next/app";
import PageLoader from "next/dist/client/page-loader";
import { Router } from "next/router";
import { ReactElement, useEffect } from "react";
import DatadogInit from "../analytics/datadog";
import { initializePosthog } from "../analytics/posthog";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { LayoutBreakpointProvider } from "../contexts/layout-breakpoint/LayoutBreakpointProvider";
import { IsReadyProvider } from "../contexts/useIsReady";
import { RouteListenerContextProvider } from "../contexts/useRouteListener";
import { NextNProgress } from "../docs/NProgress";
import { ThemeProvider } from "../docs/ThemeProvider";
import { DocsPage } from "./DocsPage";
import "./globals.css";

const store = createStore();

export function NextApp({ Component, pageProps, router }: AppProps<DocsPage.Props>): ReactElement {
    useEffect(() => {
        initializePosthog();
    }, []);

    // This is a hack to handle edge-cases related to multitenant subpath rendering:
    // We need to intercept how prefetching is done and modify the hrefs to include the subpath.
    useInterceptNextDataHref({
        router,
        basePath: pageProps.baseUrl?.basePath,
        host: pageProps.baseUrl?.domain,
    });

    return (
        <TooltipProvider>
            <FernErrorBoundary className="flex h-screen items-center justify-center" refreshOnError>
                <ThemeProvider colors={pageProps.colors}>
                    <IsReadyProvider>
                        <RouteListenerContextProvider>
                            <DatadogInit />
                            <JotaiProvider store={store}>
                                <LayoutBreakpointProvider>
                                    <NextNProgress options={{ showSpinner: false, speed: 400 }} showOnShallow={false} />
                                    <Component {...pageProps} />
                                </LayoutBreakpointProvider>
                            </JotaiProvider>
                        </RouteListenerContextProvider>
                    </IsReadyProvider>
                </ThemeProvider>
            </FernErrorBoundary>
        </TooltipProvider>
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
