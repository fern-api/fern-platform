import { FernNavigation } from "@fern-api/fdr-sdk";
import { atom, useAtomValue } from "jotai";

export const SIDEBAR_ROOT_NODE = atom<FernNavigation.SidebarRootNode | undefined>(undefined);

export const NAVIGATION_NODES_ATOM = atom<FernNavigation.NodeCollector>((get) => {
    const sidebar = get(SIDEBAR_ROOT_NODE);
    return FernNavigation.NodeCollector.collect(sidebar);
});

export function useSidebarNodes(): FernNavigation.SidebarRootNode | undefined {
    return useAtomValue(SIDEBAR_ROOT_NODE);
}

export function useNavigationNodes(): FernNavigation.NodeCollector {
    return useAtomValue(NAVIGATION_NODES_ATOM);
}
