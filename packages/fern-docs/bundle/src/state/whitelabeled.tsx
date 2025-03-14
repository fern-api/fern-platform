"use client";

import { atom, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

const whitelabeledAtom = atom(false);

export function Whitelabeled({ value }: { value: boolean }) {
  useHydrateAtoms([[whitelabeledAtom, value]], {
    dangerouslyForceHydrate: true,
  });
  return null;
}

export function useIsWhitelabeled() {
  return useAtomValue(whitelabeledAtom);
}
