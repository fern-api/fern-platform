import { FernNavigation } from "@fern-api/fdr-sdk";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallbackOne as useStableCallback } from "use-memo-one";
import { capturePosthogEvent } from "../../analytics/posthog";
import { CONTENT_HEIGHT_ATOM } from "../../atoms/layout";
import { LOCATION_ATOM } from "../../atoms/location";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { useAtomEffect } from "../../hooks/useAtomEffect";
import { PlaygroundRequestFormState } from "../types";

const PLAYGROUND_IS_OPEN_ATOM = atom(false);

const PLAYGROUND_HEIGHT_VALUE_ATOM = atom<number>(0);
export const PLAYGROUND_HEIGHT_ATOM = atom(
    (get) => {
        const playgroundHeight = Math.max(get(PLAYGROUND_HEIGHT_VALUE_ATOM), 0);
        const maxPlaygroundHeight = get(CONTENT_HEIGHT_ATOM);
        return Math.min(maxPlaygroundHeight, playgroundHeight);
    },
    (_get, set, update: number) => {
        set(PLAYGROUND_HEIGHT_VALUE_ATOM, update);
    },
);

export const PLAYGROUND_NODE_ID = atom(
    (get) => {
        const playgroundParam = get(LOCATION_ATOM).searchParams?.get("playground");
        if (playgroundParam == null) {
            return get(PREV_PLAYGROUND_NODE_ID);
        }
        return FernNavigation.NodeId(playgroundParam);
    },
    (get, set, update: FernNavigation.NodeId | undefined) => {
        const newLocation = {
            ...get(LOCATION_ATOM),
            searchParams: new URLSearchParams(get(LOCATION_ATOM).searchParams),
        };
        if (update != null) {
            // set playground open
            set(PLAYGROUND_IS_OPEN_ATOM, true);

            newLocation.searchParams.set("playground", update);

            // set playground height to be the window height - header height
            const contentHeight = get(CONTENT_HEIGHT_ATOM);
            set(PLAYGROUND_HEIGHT_ATOM, contentHeight);
        } else {
            newLocation.searchParams.delete("playground");
            set(PLAYGROUND_IS_OPEN_ATOM, false);
        }
        set(LOCATION_ATOM, newLocation);
    },
);
export const PREV_PLAYGROUND_NODE_ID = atom<FernNavigation.NodeId | undefined>(undefined);

export const PLAYGROUND_FORM_STATE_ATOM = atomWithStorage<Record<string, PlaygroundRequestFormState | undefined>>(
    "api-playground-selection-state-alpha",
    {},
);

export function usePlaygroundHeight(): number {
    return useAtomValue(PLAYGROUND_HEIGHT_ATOM);
}

export function useSetPlaygroundHeight(): (height: number) => void {
    return useSetAtom(PLAYGROUND_HEIGHT_ATOM);
}

export function usePlaygroundNodeId(): FernNavigation.NodeId | undefined {
    return useAtomValue(PLAYGROUND_NODE_ID);
}

export function useIsPlaygroundOpen(): boolean {
    return useAtomValue(PLAYGROUND_IS_OPEN_ATOM);
}

export function useClosePlayground(): () => void {
    const [nodeId, setNodeId] = useAtom(PLAYGROUND_NODE_ID);
    const setPrevNodeId = useSetAtom(PREV_PLAYGROUND_NODE_ID);
    return useStableCallback(() => {
        if (nodeId != null) {
            setPrevNodeId(nodeId);
        }
        setNodeId(undefined);
    }, [nodeId, setNodeId, setPrevNodeId]);
}

export function useOpenPlayground(): (nodeId?: FernNavigation.NodeId) => void {
    const { nodes } = useDocsContext();
    const setNodeId = useSetAtom(PLAYGROUND_NODE_ID);
    const prevNodeId = useAtomValue(PREV_PLAYGROUND_NODE_ID);
    return useStableCallback(
        (nodeId?: FernNavigation.NodeId) => {
            // TODO: "" implicitly means opne + empty state. This is a hack and we should rethink the UX.
            const nextNodeId = nodeId ?? prevNodeId ?? FernNavigation.NodeId("");
            setNodeId(nextNodeId);
            const node = nodes.get(nextNodeId);
            const apiNode = node != null && FernNavigation.isApiLeaf(node) ? node : undefined;
            capturePosthogEvent("api_playground_opened", { apiNode });
        },
        [nodes, setNodeId, prevNodeId],
    );
}

export function useTogglePlayground(): () => void {
    const isPlaygroundOpen = useIsPlaygroundOpen();
    const openPlayground = useOpenPlayground();
    const closePlayground = useClosePlayground();
    return useStableCallback(() => {
        if (isPlaygroundOpen) {
            closePlayground();
        } else {
            openPlayground();
        }
    }, [isPlaygroundOpen, openPlayground, closePlayground]);
}

export function usePlaygroundNode(): FernNavigation.NavigationNodeApiLeaf | undefined {
    const { nodes } = useDocsContext();
    const nodeId = usePlaygroundNodeId();
    if (nodeId != null) {
        const node = nodes.get(nodeId);
        if (node != null && FernNavigation.isApiLeaf(node)) {
            return node;
        }
    }
    return undefined;
}

// this should only be invoked once
export function useInitPlaygroundRouter(): void {
    useAtomEffect(
        useStableCallback((get, set) => {
            const nodeId = get(PLAYGROUND_NODE_ID);
            if (nodeId != null) {
                set(PLAYGROUND_IS_OPEN_ATOM, true);
                set(PREV_PLAYGROUND_NODE_ID, nodeId);
            }
        }, []),
    );
}
