"use client";

import { atom, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ApiDefinition } from "@fern-api/fdr-sdk";

const defaultLanguageAtom = atom("curl");

export function useDefaultProgrammingLanguage() {
  return useAtomValue(defaultLanguageAtom);
}

type LanguageStore = {
  language: string | null;
  setLanguage: React.Dispatch<React.SetStateAction<string | null>>;
};

export const useProgrammingLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: null,
      setLanguage: (action) =>
        set((prev) => {
          const language =
            typeof action === "function" ? action(prev.language) : action;
          return {
            language:
              typeof language === "string"
                ? ApiDefinition.cleanLanguage(language)
                : null,
          };
        }),
    }),
    {
      // not to be confused with internationalization,
      // this is the programming language that the user prefers to use
      name: "fern-programming-language",
      version: 1,
      merge: (persistedState, currentState) => {
        if (persistedState == null) {
          return currentState;
        }
        if (
          typeof persistedState === "object" &&
          "language" in persistedState &&
          typeof persistedState.language === "string"
        ) {
          return {
            ...currentState,
            language: ApiDefinition.cleanLanguage(persistedState.language),
          };
        }
        return currentState;
      },
    }
  )
);

export function useProgrammingLanguageValue() {
  const defaultLanguage = useAtomValue(defaultLanguageAtom);
  return useProgrammingLanguageStore((state) =>
    ApiDefinition.cleanLanguage(state.language ?? defaultLanguage)
  );
}

export function useSetProgrammingLanguage() {
  return useProgrammingLanguageStore((state) => state.setLanguage);
}

export function useProgrammingLanguage() {
  const value = useProgrammingLanguageValue();
  const setValue = useSetProgrammingLanguage();
  return [value, setValue] as const;
}

export function DefaultLanguage({ language }: { language: string }) {
  useHydrateAtoms([[defaultLanguageAtom, language]], {
    dangerouslyForceHydrate: true,
  });
  return null;
}
