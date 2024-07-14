import { atomWithStorage } from "jotai/utils";

export const FERN_LANGUAGE_ATOM = atomWithStorage<string>("fern-language-id", "curl");
FERN_LANGUAGE_ATOM.debugLabel = "FERN_LANGUAGE_ATOM";
