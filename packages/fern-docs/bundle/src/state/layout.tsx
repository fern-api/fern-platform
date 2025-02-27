"use client";

import { atom, useAtomValue, useSetAtom } from "jotai";

import { FernDocs } from "@fern-api/fdr-sdk";
import { useIsomorphicLayoutEffect } from "@fern-ui/react-commons";

const layoutAtom = atom<FernDocs.Layout>("guide");

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
