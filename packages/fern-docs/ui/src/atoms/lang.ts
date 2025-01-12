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

export type SupportedTypedLang =
  | "ts"
  | "py"
  | "go"
  | "java"
  | "cs"
  | "rb"
  | "php"
  | "swift";

export const useTypeShorthandLang = (): SupportedTypedLang | undefined => {
  const lang = useAtomValue(FERN_LANGUAGE_ATOM);
  const defaultLang = useAtomValue(DEFAULT_LANGUAGE_ATOM);
  switch ((lang ?? defaultLang).toLowerCase()) {
    case "javascript":
    case "typescript":
    case "ts":
    case "js":
    case "tsx":
    case "jsx":
    case "node":
    case "nodejs":
    case "node.js":
      return "ts";
    case "python":
    case "py":
      return "py";
    case "go":
    case "golang":
      return "go";
    case "java":
    case "kotlin":
      return "java";
    case "csharp":
    case "c#":
    case ".net":
    case "dotnet":
    case "aspnet":
      return "cs";
    case "ruby":
    case "rb":
      return "rb";
    case "php":
      return "php";
    case "swift":
      return "swift";
    default:
      return undefined;
  }
};
