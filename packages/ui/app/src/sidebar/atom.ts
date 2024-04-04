import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useTheme } from "next-themes";
import { useCallback, useEffect } from "react";
import { ResolvedRootPackage } from "../util/resolver";

export const SEARCH_DIALOG_OPEN_ATOM = atom(false);
export const MOBILE_SIDEBAR_OPEN_ATOM = atom(false);
export const APIS = atom<Record<string, ResolvedRootPackage>>({});
export const FERN_LANGUAGE_ATOM = atomWithStorage<string>("fern-language-id", "curl");

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
