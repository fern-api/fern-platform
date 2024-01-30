import "@fortawesome/fontawesome-svg-core/styles.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { AppProps } from "next/app";
import PageLoader from "next/dist/client/page-loader";
import { Router } from "next/router";
import { ReactElement, useEffect } from "react";
import { ThemeProvider } from "../docs/ThemeProvider";
import { setupFontAwesomeIcons } from "../util/setupFontAwesomeIcons";
import { DocsPage } from "./DocsPage";
import "./globals.css";

setupFontAwesomeIcons();

export function NextApp({ Component, pageProps, router }: AppProps<Partial<DocsPage.Props>>): ReactElement {
    const theme = pageProps.config?.colorsV3?.type;
    useInterceptNextDataHref({
        router,
        basePath: pageProps.baseUrl?.basePath,
    });
    return (
        <>
            <ThemeProvider theme={theme}>
                <Component {...pageProps} />
            </ThemeProvider>
            <SpeedInsights />
        </>
    );
}

// hack for basepath: https://github.com/vercel/next.js/discussions/25681#discussioncomment-2026813
const useInterceptNextDataHref = ({ router, basePath }: { router: Router; basePath: string | undefined }) => {
    useEffect(() => {
        if (basePath != null && router.pageLoader?.getDataHref) {
            const prefixedBasePath = basePath.startsWith("/") ? basePath : `/${basePath}`;
            // eslint-disable-next-line jest/unbound-method
            const originalGetDataHref = router.pageLoader.getDataHref;
            router.pageLoader.getDataHref = function (...args: Parameters<PageLoader["getDataHref"]>) {
                const r = originalGetDataHref.call(router.pageLoader, ...args);
                return r && r.startsWith("/_next/data") ? `${prefixedBasePath}${r}` : r;
            };
        }
    }, [router, basePath]);
};
