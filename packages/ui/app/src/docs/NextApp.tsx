import { FernTooltipProvider, Toaster } from "@fern-ui/components";
import { EMPTY_OBJECT } from "@fern-ui/core-utils";
import { useHydrateAtoms } from "jotai/utils";
import type { AppProps } from "next/app";
import PageLoader from "next/dist/client/page-loader";
import { Router } from "next/router";
import { PropsWithChildren, ReactElement, useEffect } from "react";
import { SWRConfig } from "swr";
import { DOCS_ATOM, DocsProps } from "../atoms";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import "../css/globals.scss";
import { NextNProgress } from "../header/NProgress";
import { ThemeScript } from "../themes/ThemeScript";

export function NextApp({ Component, pageProps, router }: AppProps<DocsProps | undefined>): ReactElement {
    // This is a hack to handle edge-cases related to multitenant subpath rendering:
    // We need to intercept how prefetching is done and modify the hrefs to include the subpath.
    useInterceptNextDataHref({
        router,
        basePath: pageProps?.baseUrl?.basePath,
        host: pageProps?.baseUrl?.domain,
    });

    return (
        <HydrateAtoms pageProps={pageProps}>
            <ThemeScript colors={pageProps?.colors} />
            <NextNProgress options={{ showSpinner: false, speed: 400 }} showOnShallow={false} />
            <Toaster />
            <FernTooltipProvider>
                <SWRConfig value={{ fallback: pageProps?.fallback ?? EMPTY_OBJECT }}>
                    <FernErrorBoundary className="flex h-screen items-center justify-center" refreshOnError>
                        <Component {...pageProps} />
                    </FernErrorBoundary>
                </SWRConfig>
            </FernTooltipProvider>
        </HydrateAtoms>
    );
}

function HydrateAtoms({ pageProps, children }: PropsWithChildren<{ pageProps: DocsProps | undefined }>) {
    useHydrateAtoms(new Map([[DOCS_ATOM, pageProps]]), { dangerouslyForceHydrate: true });
    return children;
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
        try {
            if (basePath != null && basePath !== "" && basePath !== "/" && router.pageLoader?.getDataHref) {
                const prefixedBasePath = basePath.startsWith("/") ? basePath : `/${basePath}`;

                const originalGetDataHref = router.pageLoader.getDataHref;
                router.pageLoader.getDataHref = function (...args: Parameters<PageLoader["getDataHref"]>) {
                    const r = originalGetDataHref.call(router.pageLoader, ...args);
                    return r && r.startsWith("/_next/data") ? fixHost(`${prefixedBasePath}${r}`, host) : r;
                };
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Failed to intercept next data href", e);
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
