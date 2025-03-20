"use client";

import { atom, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

const domainAtom = atom("buildwithfern.com");

export function Domain({ value }: { value: string }) {
  useHydrateAtoms([[domainAtom, value]], {
    dangerouslyForceHydrate: true,
  });
  return null;
}

export function useDomain() {
  return useAtomValue(domainAtom);
}
