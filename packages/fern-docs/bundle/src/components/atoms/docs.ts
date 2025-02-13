"use client";

import type { PropsWithChildren, ReactNode } from "react";

import { atomWithReducer, useHydrateAtoms } from "jotai/utils";

import type { DocsProps } from "./types";

export const EMPTY_DOCS_STATE: DocsProps = {
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
  useHydrateAtoms([[DOCS_ATOM, pageProps]]);
  return children;
}
