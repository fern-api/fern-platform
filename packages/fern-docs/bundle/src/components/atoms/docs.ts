"use client";

import type { PropsWithChildren, ReactNode } from "react";

import { atomWithReducer, selectAtom, useHydrateAtoms } from "jotai/utils";

import { DocsV1Read } from "@fern-api/fdr-sdk";
import { DEFAULT_EDGE_FLAGS } from "@fern-docs/utils";

import type { DocsProps } from "./types";

export const EMPTY_ANALYTICS_CONFIG: DocsV1Read.AnalyticsConfig = {
  segment: undefined,
  fullstory: undefined,
  intercom: undefined,
  posthog: undefined,
  gtm: undefined,
  ga4: undefined,
  amplitude: undefined,
  mixpanel: undefined,
  hotjar: undefined,
  koala: undefined,
  logrocket: undefined,
  pirsch: undefined,
  plausible: undefined,
  fathom: undefined,
  clearbit: undefined,
  heap: undefined,
};

export const EMPTY_DOCS_STATE: DocsProps = {
  announcement: undefined,
  baseUrl: {
    domain: "app.buildwithfern.com",
    basePath: undefined,
  },
  navigation: {
    currentTabIndex: undefined,
    tabs: [],
    currentVersionId: undefined,
    versions: [],
    sidebar: undefined,
    trailingSlash: false,
  },
  title: undefined,
  favicon: undefined,
  colors: {
    light: undefined,
    dark: undefined,
  },
  layout: undefined,
  navbarLinks: [],
  logo: {
    height: undefined,
    href: undefined,
    light: undefined,
    dark: undefined,
  },
  edgeFlags: DEFAULT_EDGE_FLAGS,
  analytics: undefined,
  analyticsConfig: EMPTY_ANALYTICS_CONFIG,
  fallback: {},
  user: undefined,
  defaultLang: "curl",
  featureFlagsConfig: undefined,
};

export const DOCS_ATOM = atomWithReducer<DocsProps, DocsProps>(
  EMPTY_DOCS_STATE,
  (_, next) => {
    if (next?.baseUrl == null) {
      return EMPTY_DOCS_STATE;
    }
    return next;
  }
);
DOCS_ATOM.debugLabel = "DOCS_ATOM";

export function HydrateAtoms({
  pageProps,
  children,
}: PropsWithChildren<{ pageProps: DocsProps | undefined }>): ReactNode {
  useHydrateAtoms(new Map([[DOCS_ATOM, pageProps]]), {
    dangerouslyForceHydrate: true,
  });
  return children;
}
