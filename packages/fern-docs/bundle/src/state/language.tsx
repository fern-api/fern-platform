"use client";

import { atom, getDefaultStore, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ApiDefinition } from "@fern-api/fdr-sdk";

const defaultLanguageAtom = atom("curl");

export function useDefaultProgrammingLanguage() {
  return useAtomValue(defaultLanguageAtom);
}

const languageStoreSchema = z.object({
  language: z.string().nullable(),
});

type LanguageStore = z.infer<typeof languageStoreSchema> & {
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
            language: language ? ApiDefinition.cleanLanguage(language) : null,
          };
        }),
    }),
    {
      // not to be confused with internationalization,
      // this is the programming language that the user prefers to use
      name: "fern-programming-language",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      merge: (persistedState, currentState) => {
        const result = languageStoreSchema.safeParse(persistedState);
        if (result.success) {
          return {
            ...currentState,
            language: result.data.language
              ? ApiDefinition.cleanLanguage(result.data.language)
              : currentState.language,
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

/**
 * This function will "peek" at the programming language from the store
 */
export function getProgrammingLanguage() {
  return (
    useProgrammingLanguageStore.getState().language ??
    getDefaultStore().get(defaultLanguageAtom)
  );
}

export function DefaultLanguage({ language }: { language: string }) {
  useHydrateAtoms([[defaultLanguageAtom, language]], {
    dangerouslyForceHydrate: true,
  });
  return null;
}
