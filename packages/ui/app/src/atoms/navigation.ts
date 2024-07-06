import { FernNavigation } from "@fern-api/fdr-sdk";
import { atom, useAtomValue } from "jotai";
import { atomWithReducer } from "jotai/utils";
import { isEqual } from "lodash-es";
import { ResolvedPath } from "../resolver/ResolvedPath";
import { SLUG_ATOM } from "./location";

export const SIDEBAR_ROOT_NODE_ATOM = atom<FernNavigation.SidebarRootNode | undefined>(undefined);

// the initial path that was hard-navigated to
export const RESOLVED_PATH_ATOM = atomWithReducer<ResolvedPath, ResolvedPath>(
    {
        type: "custom-markdown-page",
        fullSlug: "",
        title: "",
        mdx: "",
        neighbors: { prev: null, next: null },
        apis: {},
    },
    (prev: ResolvedPath, next: ResolvedPath) => (isEqual(prev, next) ? prev : next),
);

export const NAVIGATION_NODES_ATOM = atom<FernNavigation.NodeCollector>((get) => {
    const sidebar = get(SIDEBAR_ROOT_NODE_ATOM);
    return FernNavigation.NodeCollector.collect(sidebar);
});

export function useSidebarNodes(): FernNavigation.SidebarRootNode | undefined {
    return useAtomValue(SIDEBAR_ROOT_NODE_ATOM);
}

export function useNavigationNodes(): FernNavigation.NodeCollector {
    return useAtomValue(NAVIGATION_NODES_ATOM);
}

export const CURRENT_NODE_ATOM = atom((get) => {
    const slug = get(SLUG_ATOM);
    const nodeCollector = get(NAVIGATION_NODES_ATOM);
    return nodeCollector.slugMap.get(slug);
});

export const CURRENT_NODE_ID_ATOM = atom((get) => {
    const node = get(CURRENT_NODE_ATOM);
    return node?.id;
});

export function useCurrentNodeId(): FernNavigation.NodeId | undefined {
    return useAtomValue(CURRENT_NODE_ID_ATOM);
}

export function useResolvedPath(): ResolvedPath {
    return useAtomValue(RESOLVED_PATH_ATOM);
}
