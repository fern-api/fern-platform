"use client";

import React, { PropsWithChildren, ReactNode } from "react";

import { atom, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

export function tunnel(): {
  In: (props: PropsWithChildren) => null;
  Out: () => ReactNode;
  useHasChildren: () => boolean;
} {
  const currentAtom = atom<React.ReactNode>(null);

  return {
    In: ({ children }: PropsWithChildren) => {
      useHydrateAtoms([[currentAtom, children]]);
      return null;
    },

    Out: () => useAtomValue(currentAtom),

    useHasChildren: () => useAtomValue(currentAtom) != null,
  };
}
