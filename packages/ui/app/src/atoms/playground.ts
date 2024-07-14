import { FernNavigation } from "@fern-api/fdr-sdk";
import { useEventCallback } from "@fern-ui/react-commons";
import { captureMessage } from "@sentry/nextjs";
import { WritableAtom, atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomFamily, atomWithStorage, useAtomCallback } from "jotai/utils";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useCallbackOne } from "use-memo-one";
import { capturePosthogEvent } from "../analytics/posthog";
import type {
    PlaygroundEndpointRequestFormState,
    PlaygroundRequestFormState,
    PlaygroundWebSocketRequestFormState,
} from "../api-playground/types";
import { getInitialEndpointRequestFormStateWithExample } from "../api-playground/utils";
import { isEndpoint, type ResolvedEndpointDefinition, type ResolvedWebSocketChannel } from "../resolver/types";
import { APIS_ATOM, FLATTENED_APIS_ATOM } from "./apis";
import { FEATURE_FLAGS_ATOM } from "./flags";
import { useAtomEffect } from "./hooks";
import { BELOW_HEADER_HEIGHT_ATOM } from "./layout";
import { LOCATION_ATOM } from "./location";
import { NAVIGATION_NODES_ATOM } from "./navigation";

const PLAYGROUND_IS_OPEN_ATOM = atom(false);
PLAYGROUND_IS_OPEN_ATOM.debugLabel = "PLAYGROUND_IS_OPEN_ATOM";

export const HAS_PLAYGROUND_ATOM = atom(
    (get) => get(FEATURE_FLAGS_ATOM).isApiPlaygroundEnabled && Object.keys(get(APIS_ATOM)).length > 0,
);
HAS_PLAYGROUND_ATOM.debugLabel = "HAS_PLAYGROUND_ATOM";

const PLAYGROUND_HEIGHT_VALUE_ATOM = atom<number>(0);
PLAYGROUND_HEIGHT_VALUE_ATOM.debugLabel = "PLAYGROUND_HEIGHT_VALUE_ATOM";

PLAYGROUND_HEIGHT_VALUE_ATOM.onMount = (set) => {
    if (typeof window === "undefined") {
        return;
    }
    set(window.innerHeight);
};

export const PLAYGROUND_HEIGHT_ATOM = atom(
    (get) => {
        const playgroundHeight = Math.max(get(PLAYGROUND_HEIGHT_VALUE_ATOM), 0);
        const maxPlaygroundHeight = get(BELOW_HEADER_HEIGHT_ATOM);
        return Math.max(Math.min(maxPlaygroundHeight, playgroundHeight), 64);
    },
    (_get, set, update: number) => {
        set(PLAYGROUND_HEIGHT_VALUE_ATOM, update);
    },
);
PLAYGROUND_HEIGHT_ATOM.debugLabel = "PLAYGROUND_HEIGHT_ATOM";

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
            const contentHeight = get(BELOW_HEADER_HEIGHT_ATOM);
            set(PLAYGROUND_HEIGHT_ATOM, contentHeight);

            const node = get(NAVIGATION_NODES_ATOM).get(update);
            const apiNode = node != null && FernNavigation.isApiLeaf(node) ? node : undefined;
            capturePosthogEvent("api_playground_opened", { apiNode });
            set(PLAYGROUND_HEIGHT_ATOM, get(BELOW_HEADER_HEIGHT_ATOM));
        } else {
            newLocation.searchParams.delete("playground");
            set(PLAYGROUND_IS_OPEN_ATOM, false);
        }
        set(LOCATION_ATOM, newLocation);
    },
);
PLAYGROUND_NODE_ID.debugLabel = "PLAYGROUND_NODE_ID";

export const PLAYGROUND_NODE = atom((get) => {
    const nodeId = get(PLAYGROUND_NODE_ID);
    if (nodeId == null) {
        return undefined;
    }
    const node = get(NAVIGATION_NODES_ATOM).get(nodeId);
    if (node == null || !FernNavigation.isApiLeaf(node)) {
        return undefined;
    }
    return node;
});
PLAYGROUND_NODE.debugLabel = "PLAYGROUND_NODE";

export const PREV_PLAYGROUND_NODE_ID = atom<FernNavigation.NodeId | undefined>(undefined);
PREV_PLAYGROUND_NODE_ID.debugLabel = "PREV_PLAYGROUND_NODE_ID";

export function useHasPlayground(): boolean {
    return useAtomValue(HAS_PLAYGROUND_ATOM);
}

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

export function usePlaygroundNode(): FernNavigation.NavigationNodeApiLeaf | undefined {
    return useAtomValue(PLAYGROUND_NODE);
}

export function useClosePlayground(): () => void {
    const [nodeId, setNodeId] = useAtom(PLAYGROUND_NODE_ID);
    const setPrevNodeId = useSetAtom(PREV_PLAYGROUND_NODE_ID);
    return useEventCallback(() => {
        if (nodeId != null) {
            setPrevNodeId(nodeId);
        }
        setNodeId(undefined);
    });
}

export function useOpenPlayground(): (nodeId?: FernNavigation.NodeId) => void {
    const setNodeId = useSetAtom(PLAYGROUND_NODE_ID);
    const prevNodeId = useAtomValue(PREV_PLAYGROUND_NODE_ID);
    return useEventCallback((nodeId?: FernNavigation.NodeId) => {
        // TODO: "" implicitly means open + empty state. This is a hack and we should rethink the UX.
        setNodeId(nodeId ?? prevNodeId ?? FernNavigation.NodeId(""));
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

// this should only be invoked once
export function useInitPlaygroundRouter(): void {
    useAtomEffect(
        useEventCallback((get, set) => {
            const nodeId = get(PLAYGROUND_NODE_ID);
            if (nodeId != null) {
                set(PLAYGROUND_IS_OPEN_ATOM, true);
                set(PREV_PLAYGROUND_NODE_ID, nodeId);
            }
        }),
    );
}

const playgroundFormStateFamily = atomFamily((nodeId: FernNavigation.NodeId) => {
    const formStateAtom = atomWithStorage<PlaygroundRequestFormState | undefined>(nodeId, undefined);
    formStateAtom.debugLabel = `playgroundFormStateAtom-${nodeId}`;
    return formStateAtom;
});

export const usePlaygroundFormStateAtom = (
    nodeId: FernNavigation.NodeId,
): WritableAtom<
    PlaygroundRequestFormState | undefined,
    [SetStateAction<PlaygroundRequestFormState | undefined>],
    void
> => {
    const formStateAtom = playgroundFormStateFamily(nodeId);

    useEffect(() => {
        return () => {
            playgroundFormStateFamily.remove(nodeId);
        };
    }, [formStateAtom, nodeId]);

    return formStateAtom;
};

export function useSetAndOpenPlayground(): (node: FernNavigation.NavigationNodeApiLeaf) => void {
    return useAtomCallback(
        useCallbackOne((get, set, node: FernNavigation.NavigationNodeApiLeaf) => {
            const formStateAtom = playgroundFormStateFamily(node.id);
            set(PLAYGROUND_NODE_ID, node.id);
            const apiPackage = get(FLATTENED_APIS_ATOM)[node.apiDefinitionId];
            const formState = get(formStateAtom);
            if (formState != null) {
                playgroundFormStateFamily.remove(node.id);
                return;
            }

            if (apiPackage == null) {
                captureMessage("Could not find package for API playground selection state", "fatal");
                playgroundFormStateFamily.remove(node.id);
                return;
            }
            if (node.type === "endpoint") {
                const endpoint = apiPackage.apiDefinitions
                    .filter(isEndpoint)
                    .find((definition) => definition.id === node.endpointId);
                if (endpoint == null) {
                    captureMessage("Could not find endpoint for API playground selection state", "fatal");
                    return;
                }
                set(
                    formStateAtom,
                    getInitialEndpointRequestFormStateWithExample(
                        endpoint.auth,
                        endpoint,
                        endpoint.examples[0],
                        apiPackage.types,
                    ),
                );
            } else if (node.type === "webSocket") {
                const webSocket = apiPackage.apiDefinitions.find(
                    (definition) => !isEndpoint(definition) && definition.id === node.webSocketId,
                );
                if (webSocket == null) {
                    captureMessage("Could not find websocket for API playground selection state", "fatal");
                    playgroundFormStateFamily.remove(node.id);
                    return;
                }
            }
            playgroundFormStateFamily.remove(node.id);
        }, []),
    );
}

const EMPTY_ENDPOINT_REQUEST_FORM_STATE: PlaygroundEndpointRequestFormState = {
    type: "endpoint",
    auth: undefined,
    headers: {},
    pathParameters: {},
    queryParameters: {},
    body: undefined,
};

export function usePlaygroundEndpointFormState(
    endpoint: ResolvedEndpointDefinition,
): [PlaygroundEndpointRequestFormState, Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>] {
    const formStateAtom = playgroundFormStateFamily(endpoint.nodeId);
    const formState = useAtomValue(playgroundFormStateFamily(endpoint.nodeId));

    return [
        formState?.type === "endpoint" ? formState : EMPTY_ENDPOINT_REQUEST_FORM_STATE,
        useAtomCallback(
            useCallbackOne(
                (get, set, update: SetStateAction<PlaygroundEndpointRequestFormState>) => {
                    const currentFormState = get(formStateAtom);
                    const newFormState =
                        typeof update === "function"
                            ? update(
                                  currentFormState?.type === "endpoint"
                                      ? currentFormState
                                      : EMPTY_ENDPOINT_REQUEST_FORM_STATE,
                              )
                            : update;
                    set(formStateAtom, newFormState);
                },
                [formStateAtom, endpoint.nodeId],
            ),
        ),
    ];
}

const EMPTY_WEBSOCKET_REQUEST_FORM_STATE: PlaygroundWebSocketRequestFormState = {
    type: "websocket",
    auth: undefined,
    headers: {},
    pathParameters: {},
    queryParameters: {},
    messages: {},
};

export function usePlaygroundWebsocketFormState(
    channel: ResolvedWebSocketChannel,
): [PlaygroundWebSocketRequestFormState, Dispatch<SetStateAction<PlaygroundWebSocketRequestFormState>>] {
    const formStateAtom = playgroundFormStateFamily(channel.nodeId);
    const formState = useAtomValue(playgroundFormStateFamily(channel.nodeId));

    return [
        formState?.type === "websocket" ? formState : EMPTY_WEBSOCKET_REQUEST_FORM_STATE,
        useAtomCallback(
            useCallbackOne(
                (get, set, update: SetStateAction<PlaygroundWebSocketRequestFormState>) => {
                    const currentFormState = get(formStateAtom);
                    const newFormState =
                        typeof update === "function"
                            ? update(
                                  currentFormState?.type === "websocket"
                                      ? currentFormState
                                      : EMPTY_WEBSOCKET_REQUEST_FORM_STATE,
                              )
                            : update;
                    set(formStateAtom, newFormState);
                },
                [formStateAtom, channel.nodeId],
            ),
        ),
    ];
}
