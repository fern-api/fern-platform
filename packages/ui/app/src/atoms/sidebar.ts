import { atom, useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { useCallbackOne } from "use-memo-one";
import { useAtomEffect } from "./hooks";
import { DOCS_LAYOUT_ATOM } from "./layout";
import { CURRENT_NODE_ATOM, RESOLVED_PATH_ATOM, SIDEBAR_ROOT_NODE_ATOM } from "./navigation";
import { THEME_ATOM } from "./theme";
import { IS_MOBILE_SCREEN_ATOM, MOBILE_SIDEBAR_ENABLED_ATOM } from "./viewport";

export const SEARCH_DIALOG_OPEN_ATOM = atom(false);
export const MOBILE_SIDEBAR_OPEN_ATOM = atom(false);
export const DESKTOP_SIDEBAR_OPEN_ATOM = atom(false);
export const SIDEBAR_SCROLL_CONTAINER_ATOM = atom<HTMLElement | null>(null);

export const DISMISSABLE_SIDEBAR_OPEN_ATOM = atom(
    (get) => {
        const isMobileSidebarEnabled = get(MOBILE_SIDEBAR_ENABLED_ATOM);
        const isMobileScreen = get(IS_MOBILE_SCREEN_ATOM); // smallest screen size
        const isDesktopSidebarOpen = get(DESKTOP_SIDEBAR_OPEN_ATOM);
        const isMobileSidebarOpen = get(MOBILE_SIDEBAR_OPEN_ATOM);

        if (isMobileSidebarEnabled) {
            return isMobileSidebarOpen || (isDesktopSidebarOpen && !isMobileScreen);
        } else {
            return isDesktopSidebarOpen;
        }
    },
    (_get, set, update: boolean) => {
        set(DESKTOP_SIDEBAR_OPEN_ATOM, update);
        set(MOBILE_SIDEBAR_OPEN_ATOM, update);
    },
);

export const useDismissSidebar = (): (() => void) => {
    return useAtomCallback((_get, set) => {
        set(DISMISSABLE_SIDEBAR_OPEN_ATOM, false);
    });
};

// in certain cases, the sidebar should be completely removed from the DOM.
export const SIDEBAR_DISMISSABLE_ATOM = atom((get) => {
    // sidebar is always enabled on mobile, because of search + tabs
    const isMobileSidebarEnabled = get(MOBILE_SIDEBAR_ENABLED_ATOM);
    if (isMobileSidebarEnabled) {
        return true;
    }

    // sidebar is always enabled if the header is disabled
    const layout = get(DOCS_LAYOUT_ATOM);
    if (layout?.disableHeader) {
        return false;
    }

    // sidebar is always enabled if vertical tabs are enabled
    if (layout?.tabsPlacement !== "HEADER") {
        return false;
    }

    // sidebar can be null when viewing a tabbed changelog
    const sidebar = get(SIDEBAR_ROOT_NODE_ATOM);
    if (sidebar == null) {
        return true;
    }

    // If there is only one pageGroup with only one page, hide the sidebar content
    // this is useful for tabs that only have one page
    if (
        sidebar.children.length === 1 &&
        sidebar.children[0].type === "sidebarGroup" &&
        sidebar.children[0].children.length === 1 &&
        sidebar.children[0].children[0].type === "page"
    ) {
        return true;
    }

    // always hide sidebar on changelog entries
    // this may be a bit too aggressive, but it's a good starting point
    const resolvedPath = get(RESOLVED_PATH_ATOM);
    if (resolvedPath.type === "changelog-entry") {
        return true;
    }

    if (resolvedPath.type === "custom-markdown-page" && typeof resolvedPath.mdx !== "string") {
        const layout = resolvedPath.mdx.frontmatter.layout;

        if (layout === "page" || layout === "custom") {
            return true;
        }
    }

    const node = get(CURRENT_NODE_ATOM);

    if (node?.hidden) {
        return true;
    }

    return false;
});

export function useMessageHandler(): void {
    useAtomEffect(
        useCallbackOne((get, set) => {
            if (typeof window === "undefined") {
                return;
            }
            const handleMessage = (event: MessageEvent) => {
                if (event.data === "openSearchDialog") {
                    set(SEARCH_DIALOG_OPEN_ATOM, true);
                    event.source?.postMessage("searchDialogOpened", { targetOrigin: event.origin });
                } else if (event.data === "openMobileSidebar") {
                    set(MOBILE_SIDEBAR_OPEN_ATOM, true);
                    event.source?.postMessage("mobileSidebarOpened", { targetOrigin: event.origin });
                } else if (event.data === "toggleTheme") {
                    set(THEME_ATOM, get.peek(THEME_ATOM) === "dark" ? "light" : "dark");
                    event.source?.postMessage("themeToggled", { targetOrigin: event.origin });
                } else if (event.data === "setSystemTheme") {
                    set(THEME_ATOM, "system");
                    event.source?.postMessage("themeSetToSystem", { targetOrigin: event.origin });
                }
            };
            window.addEventListener("message", handleMessage);
            return () => {
                window.removeEventListener("message", handleMessage);
            };
        }, []),
    );
}

export function useIsSearchDialogOpen(): boolean {
    return useAtomValue(SEARCH_DIALOG_OPEN_ATOM);
}

export function useOpenSearchDialog(): () => void {
    const setSearchDialogState = useSetAtom(SEARCH_DIALOG_OPEN_ATOM);
    return useCallback(() => {
        setSearchDialogState(true);
    }, [setSearchDialogState]);
}

export function useCloseSearchDialog(): () => void {
    const setSearchDialogState = useSetAtom(SEARCH_DIALOG_OPEN_ATOM);
    return useCallback(() => {
        setSearchDialogState(false);
    }, [setSearchDialogState]);
}

export function useIsMobileSidebarOpen(): boolean {
    return useAtomValue(MOBILE_SIDEBAR_OPEN_ATOM);
}

export function useOpenMobileSidebar(): () => void {
    const setMobileSidebarState = useSetAtom(MOBILE_SIDEBAR_OPEN_ATOM);
    return useCallback(() => {
        setMobileSidebarState(true);
    }, [setMobileSidebarState]);
}

export function useCloseMobileSidebar(): () => void {
    const setMobileSidebarState = useSetAtom(MOBILE_SIDEBAR_OPEN_ATOM);
    return useCallback(() => {
        setMobileSidebarState(false);
    }, [setMobileSidebarState]);
}
