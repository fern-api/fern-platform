import { FernNavigation } from "@fern-api/fdr-sdk";
import { useEventCallback } from "@fern-ui/react-commons";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect } from "react";
import { capturePosthogEvent } from "../../analytics/posthog";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { PlaygroundRequestFormState } from "../types";
import { useWindowHeight } from "../useSplitPlane";

export const PLAYGROUND_NODE_ID = atom<FernNavigation.NodeId | undefined>(undefined);
export const PREV_PLAYGROUND_NODE_ID = atom<FernNavigation.NodeId | undefined>(undefined);
export const PLAYGROUND_HEIGHT_ATOM = atom<number>(0);
export const PLAYGROUND_FORM_STATE_ATOM = atomWithStorage<Record<string, PlaygroundRequestFormState | undefined>>(
    "api-playground-selection-state-alpha",
    {},
);

export function usePlaygroundNodeId(): FernNavigation.NodeId | undefined {
    return useAtomValue(PLAYGROUND_NODE_ID);
}

export function useIsPlaygroundOpen(): boolean {
    return useAtomValue(PLAYGROUND_NODE_ID) != null;
}

export function useClosePlayground(): () => void {
    const [nodeId, setNodeId] = useAtom(PLAYGROUND_NODE_ID);
    const setPrevNodeId = useSetAtom(PREV_PLAYGROUND_NODE_ID);
    const router = useRouter();
    return useEventCallback(() => {
        setPrevNodeId(nodeId);
        setNodeId(undefined);
        const newQuery = { ...router.query };
        delete newQuery.playground;
        void router.replace({ query: newQuery }, undefined, { shallow: true });
    });
}

export function useOpenPlayground(): (nodeId?: FernNavigation.NodeId) => void {
    const { nodes } = useDocsContext();
    const currNodeId = useAtomValue(PLAYGROUND_NODE_ID);
    const prevNodeId = useAtomValue(PREV_PLAYGROUND_NODE_ID);
    const router = useRouter();
    return useEventCallback((nodeId?: FernNavigation.NodeId) => {
        // TODO: "" implicitly means opne + empty state. This is a hack and we should rethink the UX.
        const nextNodeId = nodeId ?? prevNodeId ?? FernNavigation.NodeId("");

        if (currNodeId === nextNodeId) {
            return;
        }

        void router.replace({ query: { ...router.query, playground: nextNodeId } }, undefined, { shallow: true });
        const node = nodes.get(nextNodeId);
        const apiNode = node != null && FernNavigation.isApiLeaf(node) ? node : undefined;

        capturePosthogEvent("api_playground_opened", { apiNode });
    });
}

export function useTogglePlayground(): () => void {
    const isPlaygroundOpen = useIsPlaygroundOpen();
    const openPlayground = useOpenPlayground();
    const closePlayground = useClosePlayground();
    return useEventCallback(() => {
        if (isPlaygroundOpen) {
            closePlayground();
        } else {
            openPlayground();
        }
    });
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
    const router = useRouter();
    const setPlaygroundNodeId = useSetAtom(PLAYGROUND_NODE_ID);
    const setPlaygroundHeight = usePlaygroundHeight()[1];
    useEffect(() => {
        const playgroundNodeIdQueryParam =
            typeof router.query.playground === "string"
                ? FernNavigation.NodeId(decodeURIComponent(router.query.playground))
                : undefined;
        setPlaygroundNodeId(playgroundNodeIdQueryParam);
        setPlaygroundHeight((currentHeight) => {
            const windowHeight: number = window.innerHeight;
            return currentHeight < windowHeight ? windowHeight : currentHeight;
        });
    }, [router.query.playground, setPlaygroundHeight, setPlaygroundNodeId]);
}

export function usePlaygroundHeight(): [number, Dispatch<SetStateAction<number>>] {
    const { layout } = useDocsContext();
    const headerHeight =
        layout?.headerHeight == null
            ? 60
            : layout.headerHeight.type === "px"
              ? layout.headerHeight.value
              : layout.headerHeight.type === "rem"
                ? layout.headerHeight.value * 16
                : 60;
    const [playgroundHeight, setHeight] = useAtom(PLAYGROUND_HEIGHT_ATOM);
    const windowHeight = useWindowHeight();
    const height =
        windowHeight != null
            ? Math.max(Math.min(windowHeight - headerHeight, playgroundHeight), windowHeight / 3)
            : playgroundHeight;

    return [height, setHeight];
}
