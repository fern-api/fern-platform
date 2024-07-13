import { atom, useAtomValue } from "jotai";
import { DOCS_ATOM } from "./docs";

export const LOGO_TEXT_ATOM = atom<string | undefined>((get) =>
    get(DOCS_ATOM).baseUrl.domain.includes("cohere") ? "docs" : undefined,
);
export const LOGO_HREF_ATOM = atom<string | undefined>((get) => get(DOCS_ATOM).logoHref);

const DEFAULT_LOGO_HEIGHT = 20;
export const LOGO_HEIGHT_ATOM = atom<number>((get) => get(DOCS_ATOM).logoHeight ?? DEFAULT_LOGO_HEIGHT);

export function useLogoHeight(): number {
    return useAtomValue(LOGO_HEIGHT_ATOM);
}
