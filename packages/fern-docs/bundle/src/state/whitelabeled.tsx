"use client";

import { atom, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

const whitelabeledAtom = atom(false);

export function Whitelabeled({ value }: { value: boolean }) {
  useHydrateAtoms([[whitelabeledAtom, value]]);
}

export function useIsWhitelabeled() {
  return useAtomValue(whitelabeledAtom);
}
