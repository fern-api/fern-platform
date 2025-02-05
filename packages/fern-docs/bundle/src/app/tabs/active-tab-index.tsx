"use client";

import { atom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

export const activeTabAtom = atom<string | undefined>(undefined);

export default function ActiveTabIndex({
  tabId,
}: {
  tabId: string | undefined;
}) {
  useHydrateAtoms([[activeTabAtom, tabId]], {
    dangerouslyForceHydrate: true,
  });
  return false;
}
