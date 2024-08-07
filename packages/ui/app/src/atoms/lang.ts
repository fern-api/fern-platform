import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { DOCS_ATOM } from "./docs";

const INTERNAL_FERN_LANGUAGE_ATOM = atomWithStorage<string | undefined>("fern-language-id", undefined, undefined, {
    getOnInit: true,
});
INTERNAL_FERN_LANGUAGE_ATOM.debugLabel = "INTERNAL_FERN_LANGUAGE_ATOM";

export const FERN_LANGUAGE_ATOM = atom(
    (get) => get(INTERNAL_FERN_LANGUAGE_ATOM) ?? get(DOCS_ATOM).defaultLang,
    (_get, set, update: string) => {
        set(INTERNAL_FERN_LANGUAGE_ATOM, update);
    },
);
