"use client";

import React from "react";

import { atom, useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

import { FernDocs } from "@fern-api/fdr-sdk";

import { useCurrentSidebarRoot } from "./navigation";

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
