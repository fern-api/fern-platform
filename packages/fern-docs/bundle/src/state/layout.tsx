"use client";

import { atom, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

import { FernDocs } from "@fern-api/fdr-sdk";

import { useCurrentSidebarRoot } from "./navigation";

const layoutAtom = atom<FernDocs.Layout>("guide");

export function SetLayout({ value }: { value: FernDocs.Layout }) {
  useHydrateAtoms([[layoutAtom, value]], { dangerouslyForceHydrate: true });
  return null;
}

export function useLayout() {
  const layout = useAtomValue(layoutAtom);
  const sidebar = useCurrentSidebarRoot();
  if (layout === "custom") {
    return layout;
  }
  if (sidebar == null || sidebar.children.length === 0) {
    return "page";
  }

  if (
    sidebar.children.length === 1 &&
    sidebar.children[0]?.type === "sidebarGroup" &&
    sidebar.children[0].children.length === 1 &&
    sidebar.children[0].children[0]?.type === "page"
  ) {
    return "page";
  }

  return layout;
}
