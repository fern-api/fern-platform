"use client";

import { SyntaxHighlighterEdgeFlagsProvider } from "@fern-docs/syntax-highlighter";
import { ReactElement, ReactNode } from "react";
import { SWRConfig } from "swr";
import { DocsProps, HydrateAtoms } from "../atoms";
import { FeatureFlagProvider } from "../feature-flags/FeatureFlagProvider";

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
        <SWRConfig value={{ fallback: pageProps?.fallback }}>
          <SyntaxHighlighterEdgeFlagsProvider
            isDarkCodeEnabled={pageProps?.edgeFlags?.isDarkCodeEnabled ?? false}
          >
            {children}
          </SyntaxHighlighterEdgeFlagsProvider>
        </SWRConfig>
      </FeatureFlagProvider>
    </HydrateAtoms>
  );
}
