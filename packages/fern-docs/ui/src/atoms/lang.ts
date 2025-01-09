import { ApiDefinition } from "@fern-api/fdr-sdk";
import { atom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { DOCS_ATOM } from "./docs";

const INTERNAL_FERN_LANGUAGE_ATOM = atomWithStorage<string | undefined>(
  "fern-language-id",
  undefined,
  undefined,
  {
    getOnInit: true,
  }
);
INTERNAL_FERN_LANGUAGE_ATOM.debugLabel = "INTERNAL_FERN_LANGUAGE_ATOM";

export const FERN_LANGUAGE_ATOM = atom(
  (get) => {
    const lang = get(INTERNAL_FERN_LANGUAGE_ATOM);
    if (lang == null) {
      return undefined;
    }
    return ApiDefinition.cleanLanguage(lang);
  },
  (_get, set, update: string) => {
    void set(INTERNAL_FERN_LANGUAGE_ATOM, update);
  }
);

export const DEFAULT_LANGUAGE_ATOM = atom<string>((get) =>
  ApiDefinition.cleanLanguage(get(DOCS_ATOM).defaultLang)
);

export type SupportedTypedLang = "ts" | "py";

export const useTypeShorthandLang = (): SupportedTypedLang | undefined => {
  const lang = useAtomValue(FERN_LANGUAGE_ATOM);
  const defaultLang = useAtomValue(DEFAULT_LANGUAGE_ATOM);
  switch (lang ?? defaultLang) {
    case "javascript":
    case "typescript":
      return "ts";
    case "python":
      return "py";
  }
  return undefined;
};
