"use client";

import { atom, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

const darkCodeAtom = atom(false);

/**
 * forces dark-mode on all code blocks
 */
export function DarkCode({ value }: { value: boolean }) {
  useHydrateAtoms([[darkCodeAtom, value]]);
  return null;
}

export function useIsDarkCode() {
  return useAtomValue(darkCodeAtom);
}
