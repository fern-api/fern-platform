"use client";

import { atom, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

import { FernColorTheme } from "@/server/types";

export const colorsAtom = atom<{
  light?: FernColorTheme;
  dark?: FernColorTheme;
}>({
  light: undefined,
  dark: undefined,
});

export function SetColors({
  colors,
}: {
  colors: {
    light?: FernColorTheme;
    dark?: FernColorTheme;
  };
}) {
  useHydrateAtoms([[colorsAtom, colors]], {
    dangerouslyForceHydrate: true,
  });
  return null;
}

export const useColors = () => {
  return useAtomValue(colorsAtom);
};
