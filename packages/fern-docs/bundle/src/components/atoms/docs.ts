import type { PropsWithChildren, ReactNode } from "react";

import { isEqual } from "es-toolkit/predicate";
import { atomWithReducer, selectAtom, useHydrateAtoms } from "jotai/utils";

import { DocsV1Read } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { DEFAULT_EDGE_FLAGS } from "@fern-docs/utils";

import type { DocsProps, JsConfig } from "./types";

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

export const JS_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.js, isEqual);

export function withCustomJavascript(
  readShapeJsConfig: DocsV1Read.JsConfig | undefined,
  resolveFileSrc: (fileId: string) => { src: string } | undefined
): JsConfig | undefined {
  const remote = [
    ...(readShapeJsConfig?.remote ?? []),
    ...(readShapeJsConfig?.files ?? []).map((file) => ({
      url: resolveFileSrc(file.fileId)?.src,
      strategy: file.strategy,
    })),
  ].filter(isRemote);

  const toRet = {
    inline: readShapeJsConfig?.inline,
    remote: remote.length > 0 ? remote : undefined,
  };

  if (!toRet.inline && !toRet.remote) {
    return undefined;
  }

  return toRet;
}

type RemoteJs = NonNullable<JsConfig["remote"]>[number];

function isRemote(remote: {
  url: string | undefined; // potentially undefined if the file is not found
  strategy: RemoteJs["strategy"];
}): remote is RemoteJs {
  return remote.url != null;
}
