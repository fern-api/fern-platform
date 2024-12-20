import { EMPTY_OBJECT } from "@fern-api/ui-core-utils";
import { FernTooltipProvider, Toaster } from "@fern-ui/components";
import { SyntaxHighlighterFeatureFlagsProvider } from "@fern-ui/fern-docs-syntax-highlighter";
import { Provider as JotaiProvider } from "jotai";
import type { AppProps } from "next/app";
import { ReactElement } from "react";
import { SWRConfig } from "swr";
import { DocsProps, HydrateAtoms, store } from "../atoms";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { LocalPreviewContextProvider } from "../contexts/local-preview";
import "../css/globals.scss";
import { NextNProgress } from "../header/NProgress";
import { useInterceptNextDataHref } from "../hooks/useInterceptNextDataHref";
import { ThemeScript } from "../themes/ThemeScript";
import { CustomerAnalytics } from "./CustomerAnalytics";

export function NextApp({ Component, pageProps, router }: AppProps<DocsProps | undefined>): ReactElement {
    // This is a hack to handle edge-cases related to multitenant subpath rendering:
    // We need to intercept how prefetching is done and modify the hrefs to include the subpath.
    useInterceptNextDataHref({
        router,
        basePath: pageProps?.baseUrl?.basePath,
    });

    return (
        <JotaiProvider store={store}>
            <HydrateAtoms pageProps={pageProps}>
                <CustomerAnalytics />
                <ThemeScript colors={pageProps?.colors} />
                <NextNProgress options={{ showSpinner: false, speed: 400 }} showOnShallow={false} />
                <Toaster />
                <FernTooltipProvider>
                    <SWRConfig value={{ fallback: pageProps?.fallback ?? EMPTY_OBJECT }}>
                        <FernErrorBoundary className="flex h-screen items-center justify-center" refreshOnError>
                            <SyntaxHighlighterFeatureFlagsProvider
                                isDarkCodeEnabled={pageProps?.featureFlags?.isDarkCodeEnabled ?? false}
                            >
                                <Component {...pageProps} />
                            </SyntaxHighlighterFeatureFlagsProvider>
                        </FernErrorBoundary>
                    </SWRConfig>
                </FernTooltipProvider>
            </HydrateAtoms>
        </JotaiProvider>
    );
}

// local preview doesn't use getServerSideProps, so pageProps is always undefined
export function LocalPreviewNextApp({ Component }: AppProps): ReactElement {
    return (
        <JotaiProvider store={store}>
            <LocalPreviewContextProvider>
                <NextNProgress options={{ showSpinner: false, speed: 400 }} showOnShallow={false} />
                <Toaster />
                <FernTooltipProvider>
                    <FernErrorBoundary className="flex h-screen items-center justify-center" refreshOnError>
                        <Component />
                    </FernErrorBoundary>
                </FernTooltipProvider>
            </LocalPreviewContextProvider>
        </JotaiProvider>
    );
}
