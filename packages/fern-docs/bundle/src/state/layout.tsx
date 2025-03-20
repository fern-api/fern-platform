"use client";

import { atom, useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

import { FernDocs } from "@fern-api/fdr-sdk";
import { useIsomorphicLayoutEffect } from "@fern-ui/react-commons";

const isSidebarFixedAtom = atom<boolean>(false);

export function SetIsSidebarFixed({ value }: { value: boolean }) {
  useHydrateAtoms([[isSidebarFixedAtom, value]], {
    dangerouslyForceHydrate: true,
  });
  return null;
}

export function useIsSidebarFixed() {
  return useAtomValue(isSidebarFixedAtom);
}

const isLandingPageAtom = atom<boolean>(false);

export function SetIsLandingPage({ value }: { value: boolean }) {
  useHydrateAtoms([[isLandingPageAtom, value]], {
    dangerouslyForceHydrate: true,
  });
  return null;
}

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
  const isSidebarFixed = useAtomValue(isSidebarFixedAtom);
  const layout = useLayout();
  const emptySidebar = useAtomValue(emptySidebarAtom);
  const isLandingPage = useAtomValue(isLandingPageAtom);

  // only guides and overviews currently have table of contents
  const emptyTableOfContents =
    useAtomValue(emptyTableOfContentsAtom) ||
    (layout !== "guide" && layout !== "overview");

  // page layout should supersede a fixed sidebar
  if (layout === "custom" || layout === "page" || isLandingPage) {
    return true;
  }

  if (isSidebarFixed) {
    return false;
  }

  return emptySidebar && emptyTableOfContents;
}

export function HideAsides({ force }: { force?: boolean }) {
  const hideAsides = useShouldHideAsides();
  return hideAsides || force ? (
    <style jsx global>{`
      #fern-toc,
      #fern-sidebar[data-state="sticky"],
      #fern-sidebar[data-state="fixed"],
      #fern-sidebar-spacer {
        visibility: hidden;
        width: 0;
        overflow: hidden;
      }
    `}</style>
  ) : null;
}
