import { FernTooltipProvider, Toaster } from "@fern-docs/components";
import { Provider as JotaiProvider } from "jotai";
import type { AppProps } from "next/app";
import { ReactElement } from "react";
import { DocsProps, store } from "../atoms";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { LocalPreviewContextProvider } from "../contexts/local-preview";
import "../css/globals.scss";
import { NextNProgress } from "../header/NProgress";
import { useInterceptNextDataHref } from "../hooks/useInterceptNextDataHref";
import { Providers } from "./Providers";

export function NextApp({
  Component,
  pageProps,
  router,
}: AppProps<DocsProps | undefined>): ReactElement {
  // This is a hack to handle edge-cases related to multitenant subpath rendering:
  // We need to intercept how prefetching is done and modify the hrefs to include the subpath.
  useInterceptNextDataHref({
    router,
    basePath: pageProps?.baseUrl?.basePath,
  });

  return (
    <Providers pageProps={pageProps}>
      <Component {...pageProps} />
    </Providers>
  );
}

// local preview doesn't use getServerSideProps, so pageProps is always undefined
export function LocalPreviewNextApp({ Component }: AppProps): ReactElement {
  return (
    <JotaiProvider store={store}>
      <LocalPreviewContextProvider>
        <NextNProgress
          options={{ showSpinner: false, speed: 400 }}
          showOnShallow={false}
        />
        <Toaster />
        <FernTooltipProvider>
          <FernErrorBoundary
            className="flex h-screen items-center justify-center"
            refreshOnError
          >
            <Component />
          </FernErrorBoundary>
        </FernTooltipProvider>
      </LocalPreviewContextProvider>
    </JotaiProvider>
  );
}
