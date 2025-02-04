"use client";

import { atom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

export const activeTabAtom = atom<number | undefined>(undefined);

export default function ActiveTabIndex({
  tabIndex,
}: {
  tabIndex: number | undefined;
}) {
  useHydrateAtoms([[activeTabAtom, tabIndex]], {
    dangerouslyForceHydrate: true,
  });
  return false;
}
