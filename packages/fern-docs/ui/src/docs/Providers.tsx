"use client";

import { DocsV1Read } from "@fern-api/fdr-sdk";
import { EMPTY_OBJECT } from "@fern-api/ui-core-utils";
import { FernTooltipProvider, Toaster } from "@fern-docs/components";
import { SyntaxHighlighterEdgeFlagsProvider } from "@fern-docs/syntax-highlighter";
import { isEqual } from "es-toolkit/predicate";
import { Provider as JotaiProvider, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { memo, PropsWithChildren, ReactElement } from "react";
import { SWRConfig } from "swr";
import { CustomerAnalytics } from "../analytics/CustomerAnalytics";
import {
  DOCS_ATOM,
  DocsProps,
  DOMAIN_ATOM,
  EMPTY_ANALYTICS_CONFIG,
  HydrateAtoms,
  store,
} from "../atoms";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import "../css/globals.scss";
import { FeatureFlagProvider } from "../feature-flags/FeatureFlagProvider";
import { NextNProgress } from "../header/NProgress";
import { ThemeScript } from "../themes/ThemeScript";

const ANALYTICS_CONFIG_ATOM = selectAtom<DocsProps, DocsV1Read.AnalyticsConfig>(
  DOCS_ATOM,
  (docs) => docs.analyticsConfig ?? EMPTY_ANALYTICS_CONFIG,
  isEqual
);

const CustomerAnalyticsProvider = memo(
  function CustomerAnalyticsProvider(): ReactElement | null {
    const domain = useAtomValue(DOMAIN_ATOM);
    const config = useAtomValue(ANALYTICS_CONFIG_ATOM);

    return <CustomerAnalytics domain={domain} config={config} />;
  }
);

export function Providers({
  pageProps,
  children,
}: PropsWithChildren<{ pageProps?: DocsProps }>): ReactElement {
  return (
    <JotaiProvider store={store}>
      <HydrateAtoms pageProps={pageProps}>
        <FeatureFlagProvider featureFlagsConfig={pageProps?.featureFlagsConfig}>
          <ThemeScript colors={pageProps?.colors} />
          <NextNProgress
            options={{ showSpinner: false, speed: 400 }}
            showOnShallow={false}
          />
          <CustomerAnalyticsProvider />
          <Toaster />
          <FernTooltipProvider>
            <SWRConfig
              value={{
                fallback: pageProps?.fallback ?? EMPTY_OBJECT,
              }}
            >
              <FernErrorBoundary
                className="flex h-screen items-center justify-center"
                refreshOnError
              >
                <SyntaxHighlighterEdgeFlagsProvider
                  isDarkCodeEnabled={
                    pageProps?.edgeFlags?.isDarkCodeEnabled ?? false
                  }
                >
                  {children}
                </SyntaxHighlighterEdgeFlagsProvider>
              </FernErrorBoundary>
            </SWRConfig>
          </FernTooltipProvider>
        </FeatureFlagProvider>
      </HydrateAtoms>
    </JotaiProvider>
  );
}
