import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

export const MOBILE_SIDEBAR_OPEN_ATOM = atom(false);

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
