import { atom, useAtomValue } from "jotai";
import { DOCS_ATOM } from "./docs";
import { FEATURE_FLAGS_ATOM } from "./flags";

export const LOGO_TEXT_ATOM = atom<string | undefined>((get) =>
    get(FEATURE_FLAGS_ATOM).isDocsLogoTextEnabled ? "docs" : undefined,
);
LOGO_TEXT_ATOM.debugLabel = "LOGO_TEXT_ATOM";

export const LOGO_HREF_ATOM = atom<string | undefined>((get) => get(DOCS_ATOM).logoHref);
LOGO_HREF_ATOM.debugLabel = "LOGO_HREF_ATOM";

const DEFAULT_LOGO_HEIGHT = 20;
export const LOGO_HEIGHT_ATOM = atom<number>((get) => get(DOCS_ATOM).logoHeight ?? DEFAULT_LOGO_HEIGHT);
LOGO_HEIGHT_ATOM.debugLabel = "LOGO_HEIGHT_ATOM";

export function useLogoHeight(): number {
    return useAtomValue(LOGO_HEIGHT_ATOM);
}
