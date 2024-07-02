import { DocsV1Read } from "@fern-api/fdr-sdk";
import { atom } from "jotai/vanilla";
import { WINDOW_HEIGHT_ATOM } from "./window";

export const DOCS_LAYOUT_ATOM = atom<DocsV1Read.DocsLayoutConfig | undefined>(undefined);
export const HEADER_HEIGHT_ATOM = atom<number>((get) => {
    const layout = get(DOCS_LAYOUT_ATOM);
    return layout?.headerHeight == null
        ? 60
        : layout.headerHeight.type === "px"
          ? layout.headerHeight.value
          : layout.headerHeight.type === "rem"
            ? layout.headerHeight.value * 16
            : 60;
});
export const CONTENT_HEIGHT_ATOM = atom<number>((get) => {
    const headerHeight = get(HEADER_HEIGHT_ATOM);
    const windowHeight = get(WINDOW_HEIGHT_ATOM);
    return Math.max(windowHeight - headerHeight, 0);
});
