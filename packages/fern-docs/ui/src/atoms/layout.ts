import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import { isEqual } from "es-toolkit/predicate";
import { atom } from "jotai";
import { selectAtom } from "jotai/utils";
import { ANNOUNCEMENT_HEIGHT_ATOM } from "./announcement";
import { DOCS_ATOM } from "./docs";
import { TABS_ATOM } from "./navigation";
import { MOBILE_SIDEBAR_ENABLED_ATOM, VIEWPORT_HEIGHT_ATOM } from "./viewport";

export const DOCS_LAYOUT_ATOM = selectAtom(
  DOCS_ATOM,
  (docs): DocsV1Read.DocsLayoutConfig | undefined => docs.layout,
  isEqual
);
DOCS_LAYOUT_ATOM.debugLabel = "DOCS_LAYOUT_ATOM";

function getHeaderHeightPx(
  layout: DocsV1Read.DocsLayoutConfig | undefined
): number {
  if (layout?.headerHeight?.type === "px") {
    return layout.headerHeight.value;
  } else if (layout?.headerHeight?.type === "rem") {
    return layout.headerHeight.value * 16;
  } else {
    return 64;
  }
}

export const HEADER_HEIGHT_ATOM = atom<number>((get) => {
  const layout = get(DOCS_LAYOUT_ATOM);
  const isMobileSidebarEnabled = get(MOBILE_SIDEBAR_ENABLED_ATOM);
  const headerHeight = getHeaderHeightPx(layout);
  return isMobileSidebarEnabled || layout?.disableHeader !== true
    ? headerHeight
    : 0;
});
HEADER_HEIGHT_ATOM.debugLabel = "HEADER_HEIGHT_ATOM";

export const MOBILE_HEADER_HEIGHT_ATOM = atom<number>((get) => {
  return getHeaderHeightPx(get(DOCS_LAYOUT_ATOM));
});

const SETTABLE_HEADER_TABS_HEIGHT_ATOM = atom<number>(44);
SETTABLE_HEADER_TABS_HEIGHT_ATOM.debugLabel =
  "SETTABLE_HEADER_TABS_HEIGHT_ATOM";

const SETTABLE_CONTENT_HEIGHT_ATOM = atom<number>(0);
SETTABLE_CONTENT_HEIGHT_ATOM.debugLabel = "SETTABLE_CONTENT_HEIGHT_ATOM";

export const HAS_HORIZONTAL_TABS = atom<boolean>((get) => {
  const layout = get(DOCS_LAYOUT_ATOM);
  const tabs = get(TABS_ATOM);

  if (
    layout?.tabsPlacement !== "HEADER" ||
    layout?.disableHeader ||
    tabs.length === 0
  ) {
    return false;
  }

  return !get(MOBILE_SIDEBAR_ENABLED_ATOM);
});
HAS_HORIZONTAL_TABS.debugLabel = "HAS_HORIZONTAL_TABS";

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
  }
);
HEADER_TABS_HEIGHT_ATOM.debugLabel = "HEADER_TABS_HEIGHT_ATOM";

export const SHOW_HEADER_ATOM = atom((get) => {
  const layout = get(DOCS_LAYOUT_ATOM);
  const isMobileSidebarEnabled = get(MOBILE_SIDEBAR_ENABLED_ATOM);
  return layout?.disableHeader !== true || isMobileSidebarEnabled;
});
SHOW_HEADER_ATOM.debugLabel = "SHOW_HEADER_ATOM";

export const POSITION_SEARCH_DIALOG_OVER_HEADER_ATOM = atom<boolean>((get) => {
  const showHeader = get(SHOW_HEADER_ATOM);
  const layout = get(DOCS_LAYOUT_ATOM);
  const isMobileSidebarEnabled = get(MOBILE_SIDEBAR_ENABLED_ATOM);
  return (
    showHeader &&
    layout?.searchbarPlacement === "HEADER" &&
    !isMobileSidebarEnabled
  );
});
POSITION_SEARCH_DIALOG_OVER_HEADER_ATOM.debugLabel =
  "POSITION_SEARCH_DIALOG_OVER_HEADER_ATOM";

export const HEADER_OFFSET_ATOM = atom<number>((get) => {
  const announcementHeight = get(ANNOUNCEMENT_HEIGHT_ATOM);
  if (!get(SHOW_HEADER_ATOM)) {
    return announcementHeight;
  }
  const headerHeight = get(HEADER_HEIGHT_ATOM);
  const tabsHeight = get(HEADER_TABS_HEIGHT_ATOM);
  return headerHeight + tabsHeight + announcementHeight;
});
HEADER_OFFSET_ATOM.debugLabel = "HEADER_OFFSET_ATOM";

export const MOBILE_HEADER_OFFSET_ATOM = atom<number>((get) => {
  return get(MOBILE_HEADER_HEIGHT_ATOM) + get(ANNOUNCEMENT_HEIGHT_ATOM);
});

export const BELOW_HEADER_HEIGHT_ATOM = atom<number>((get) => {
  const headerHeight = get(HEADER_HEIGHT_ATOM);
  const windowHeight = get(VIEWPORT_HEIGHT_ATOM);
  return Math.max(windowHeight - headerHeight, 0);
});
BELOW_HEADER_HEIGHT_ATOM.debugLabel = "BELOW_HEADER_HEIGHT_ATOM";

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
  }
);
CONTENT_HEIGHT_ATOM.debugLabel = "CONTENT_HEIGHT_ATOM";

export const SEARCHBAR_PLACEMENT_ATOM = atom<DocsV1Read.SearchbarPlacement>(
  (get) => {
    const layout = get(DOCS_LAYOUT_ATOM);
    if (layout?.disableHeader) {
      return "SIDEBAR";
    }

    // default to sidebar if searchbarPlacement is not set
    if (layout?.searchbarPlacement == null) {
      return "SIDEBAR";
    }

    return layout.searchbarPlacement;
  }
);
SEARCHBAR_PLACEMENT_ATOM.debugLabel = "SEARCHBAR_PLACEMENT_ATOM";
