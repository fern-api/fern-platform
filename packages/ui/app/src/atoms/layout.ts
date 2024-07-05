import { DocsV1Read } from "@fern-api/fdr-sdk";
import { atom } from "jotai/vanilla";
import { MOBILE_SIDEBAR_ENABLED_ATOM, VIEWPORT_HEIGHT_ATOM } from "./viewport";

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

const SETTABLE_HEADER_TABS_HEIGHT_ATOM = atom<number>(44);
const SETTABLE_CONTENT_HEIGHT_ATOM = atom<number>(0);

const HAS_HORIZONTAL_TABS = atom<boolean>((get) => {
    const layout = get(DOCS_LAYOUT_ATOM);

    // todo: check if tabs.length > 0
    if (layout?.tabsPlacement !== "HEADER") {
        return false;
    }

    const isMobileSidebarEnabled = get(MOBILE_SIDEBAR_ENABLED_ATOM);

    return !isMobileSidebarEnabled;
});

export const HEADER_TABS_HEIGHT_ATOM = atom(
    (get) => {
        const hasTabs = get(HAS_HORIZONTAL_TABS);
        if (!hasTabs) {
            return 0;
        }
        return get(SETTABLE_HEADER_TABS_HEIGHT_ATOM);
    },
    (_get, set, height: number) => {
        set(SETTABLE_HEADER_TABS_HEIGHT_ATOM, height);
    },
);

export const HEADER_OFFSET_ATOM = atom<number>((get) => {
    const headerHeight = get(HEADER_HEIGHT_ATOM);
    const tabsHeight = get(HEADER_TABS_HEIGHT_ATOM);
    return headerHeight + tabsHeight;
});

export const BELOW_HEADER_HEIGHT_ATOM = atom<number>((get) => {
    const headerHeight = get(HEADER_HEIGHT_ATOM);
    const windowHeight = get(VIEWPORT_HEIGHT_ATOM);
    return Math.max(windowHeight - headerHeight, 0);
});

export const CONTENT_HEIGHT_ATOM = atom(
    (get) => {
        const settableContentHeight = get(SETTABLE_CONTENT_HEIGHT_ATOM);
        if (settableContentHeight > 0) {
            return settableContentHeight;
        }

        // fallback to calculating the content height based on the viewport height
        const headerHeight = get(HEADER_OFFSET_ATOM);
        const viewportHeight = get(VIEWPORT_HEIGHT_ATOM);
        return Math.max(viewportHeight - headerHeight, 0);
    },
    (_get, set, height: number) => {
        set(SETTABLE_CONTENT_HEIGHT_ATOM, height);
    },
);

export const SHOW_SEARCH_BAR_IN_SIDEBAR_ATOM = atom<boolean>((get) => {
    const layout = get(DOCS_LAYOUT_ATOM);
    return layout?.disableHeader || layout?.searchbarPlacement !== "HEADER";
});
