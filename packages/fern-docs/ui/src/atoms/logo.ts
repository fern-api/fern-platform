import { DEFAULT_LOGO_HEIGHT, type ImageData } from "@fern-docs/utils";
import { isEqual } from "es-toolkit/predicate";
import { atom } from "jotai";
import { selectAtom } from "jotai/utils";
import { DOCS_ATOM } from "./docs";
import { EDGE_FLAGS_ATOM } from "./flags";
import { BASEPATH_ATOM } from "./navigation";

export const LOGO_TEXT_ATOM = atom<string | undefined>((get) =>
  get(EDGE_FLAGS_ATOM).isDocsLogoTextEnabled ? "docs" : undefined
);

const INTERNAL_LOGO_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.logo, isEqual);

interface LogoConfiguration {
  href: string;
  height: number;
  light: ImageData | undefined;
  dark: ImageData | undefined;
}

export const LOGO_ATOM = atom<LogoConfiguration>((get) => {
  const logo = get(INTERNAL_LOGO_ATOM);
  const basepath = get(BASEPATH_ATOM);
  return {
    href: logo.href ?? basepath ?? "/",
    height: logo.height && logo.height > 0 ? logo.height : DEFAULT_LOGO_HEIGHT,
    light: logo.light,
    dark: logo.dark,
  };
});
