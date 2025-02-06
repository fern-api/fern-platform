"use client";

import { Toaster } from "@fern-docs/components";
import { SyntaxHighlighterEdgeFlagsProvider } from "@fern-docs/syntax-highlighter";
import { ReactElement, ReactNode } from "react";
import { SWRConfig } from "swr";
import { CustomerAnalytics } from "../analytics/CustomerAnalytics";
import { DocsProps, HydrateAtoms } from "../atoms";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { FeatureFlagProvider } from "../feature-flags/FeatureFlagProvider";
import { ThemeScript } from "../themes/ThemeScript";

export function NextApp({
  children,
  pageProps,
}: {
  children: ReactNode;
  pageProps: DocsProps | undefined;
}): ReactElement {
  return (
    <HydrateAtoms pageProps={pageProps}>
      <FeatureFlagProvider featureFlagsConfig={pageProps?.featureFlagsConfig}>
        <ThemeScript colors={pageProps?.colors} />
        <CustomerAnalytics />
        <Toaster />
        <SWRConfig value={{ fallback: pageProps?.fallback }}>
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
      </FeatureFlagProvider>
    </HydrateAtoms>
  );
}
