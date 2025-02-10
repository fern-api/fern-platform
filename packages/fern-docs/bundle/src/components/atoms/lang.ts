import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { ApiDefinition } from "@fern-api/fdr-sdk";

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
    set(INTERNAL_FERN_LANGUAGE_ATOM, update);
  }
);

export const DEFAULT_LANGUAGE_ATOM = atom<string>((get) =>
  ApiDefinition.cleanLanguage(get(DOCS_ATOM).defaultLang)
);
