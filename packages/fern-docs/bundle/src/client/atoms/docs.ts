import { DocsV1Read } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { DEFAULT_EDGE_FLAGS, DEFAULT_LOGO_HEIGHT } from "@fern-docs/utils";
import { isEqual } from "es-toolkit/predicate";
import { atomWithReducer, selectAtom, useHydrateAtoms } from "jotai/utils";
import type { PropsWithChildren, ReactNode } from "react";
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
  js: undefined,
  navbarLinks: [],
  logo: {
    height: DEFAULT_LOGO_HEIGHT,
    href: "/",
    light: undefined,
    dark: undefined,
  },
  content: {
    type: "markdown-page",
    slug: FernNavigation.Slug(""),
    title: "",
    subtitle: undefined,
    breadcrumb: [],
    tableOfContents: [],
    content: "",
    neighbors: { prev: null, next: null },
    hasAside: false,
    apis: {},
    endpointIdsToSlugs: {},
  },
  edgeFlags: DEFAULT_EDGE_FLAGS,
  apis: [],
  seo: {},
  analytics: undefined,
  analyticsConfig: EMPTY_ANALYTICS_CONFIG,
  fallback: {},
  theme: "default",
  user: undefined,
  defaultLang: "curl",
  stylesheet: "",
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

export const JS_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.js, isEqual);
