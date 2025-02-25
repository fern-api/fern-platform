"use client";

import React from "react";

import { atom, useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

import { FernDocs } from "@fern-api/fdr-sdk";

const layoutAtom = atom<FernDocs.Layout>("guide");

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function SetLayout({ value }: { value: FernDocs.Layout }) {
  const setLayout = useSetAtom(layoutAtom);
  useIsomorphicLayoutEffect(() => {
    setLayout(value);
  }, [value]);
  return null;
}

export function useLayout() {
  return useAtomValue(layoutAtom);
}

const emptySidebarAtom = atom<boolean>(false);
const emptyTableOfContentsAtom = atom<boolean>(false);

export function SetEmptySidebar({ value }: { value: boolean }) {
  const setEmptySidebar = useSetAtom(emptySidebarAtom);
  useIsomorphicLayoutEffect(() => {
    setEmptySidebar(value);
  }, [value]);
  return null;
}

export function SetEmptyTableOfContents({ value }: { value: boolean }) {
  const setEmptyTableOfContents = useSetAtom(emptyTableOfContentsAtom);
  useIsomorphicLayoutEffect(() => {
    setEmptyTableOfContents(value);
  }, [value]);
  return null;
}

export function useShouldHideAsides() {
  const layout = useLayout();
  const emptySidebar = useAtomValue(emptySidebarAtom);

  // only guides and overviews currently have table of contents
  const emptyTableOfContents =
    useAtomValue(emptyTableOfContentsAtom) ||
    (layout !== "guide" && layout !== "overview");

  if (layout === "custom" || layout === "page") {
    return true;
  }

  return emptySidebar && emptyTableOfContents;
}
