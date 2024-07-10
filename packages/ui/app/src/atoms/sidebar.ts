import { atom, useAtomValue, useSetAtom } from "jotai";
import { useTheme } from "next-themes";
import { useCallback, useEffect } from "react";
import { DOCS_LAYOUT_ATOM } from "./layout";
import { CURRENT_NODE_ATOM, RESOLVED_PATH_ATOM, SIDEBAR_ROOT_NODE_ATOM } from "./navigation";
import { IS_MOBILE_SCREEN_ATOM, MOBILE_SIDEBAR_ENABLED_ATOM } from "./viewport";

export const SEARCH_DIALOG_OPEN_ATOM = atom(false);
export const MOBILE_SIDEBAR_OPEN_ATOM = atom(false);
export const DESKTOP_SIDEBAR_OPEN_ATOM = atom(false);
export const SIDEBAR_SCROLL_CONTAINER_ATOM = atom<HTMLElement | null>(null);

export const DISMISSABLE_SIDEBAR_OPEN_ATOM = atom((get) => {
    return get(MOBILE_SIDEBAR_OPEN_ATOM) || (get(DESKTOP_SIDEBAR_OPEN_ATOM) && !get(IS_MOBILE_SCREEN_ATOM));
});

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
    const openSearchDialog = useOpenSearchDialog();
    const openMobileSidebar = useOpenMobileSidebar();
    const { resolvedTheme, setTheme } = useTheme();
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const handleMessage = (event: MessageEvent) => {
            if (event.data === "openSearchDialog") {
                openSearchDialog();
                event.source?.postMessage("searchDialogOpened", { targetOrigin: event.origin });
            } else if (event.data === "openMobileSidebar") {
                openMobileSidebar();
                event.source?.postMessage("mobileSidebarOpened", { targetOrigin: event.origin });
            } else if (event.data === "toggleTheme") {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
                event.source?.postMessage("themeToggled", { targetOrigin: event.origin });
            } else if (event.data === "setSystemTheme") {
                setTheme("system");
                event.source?.postMessage("themeSetToSystem", { targetOrigin: event.origin });
            }
        };
        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [openMobileSidebar, openSearchDialog, resolvedTheme, setTheme]);
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
