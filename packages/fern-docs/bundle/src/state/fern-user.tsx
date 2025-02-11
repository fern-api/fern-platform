"use client";

import { Atom, atom, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

import type { FernUser } from "@fern-docs/auth";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";

interface UseFernUserOptions {
  /**
   * A fern user atom for testing purposes only
   */
  __test_fern_user_atom?: Atom<FernUser | undefined>;
}

export const fernUserAtom = atom<FernUser | undefined>(undefined);

export function SetFernUser({ value }: { value: FernUser | undefined }) {
  const memoizedValue = useDeepCompareMemoize(value);
  useHydrateAtoms([[fernUserAtom, memoizedValue]], {
    dangerouslyForceHydrate: true,
  });
  return null;
}

export function useFernUser({
  __test_fern_user_atom,
}: UseFernUserOptions = {}): FernUser | undefined {
  return useAtomValue(__test_fern_user_atom ?? fernUserAtom);
}
