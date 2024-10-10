import {
    EndpointContext,
    WebSocketContext,
    createEndpointContext,
    createWebSocketContext,
} from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useEventCallback } from "@fern-ui/react-commons";
import { WritableAtom, atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomFamily, atomWithStorage, useAtomCallback } from "jotai/utils";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useCallbackOne } from "use-memo-one";
import { selectHref } from "../hooks/useHref";
import { usePreloadApiLeaf } from "../playground/hooks/usePreloadApiLeaf";
import {
    PLAYGROUND_AUTH_STATE_BASIC_AUTH_INITIAL,
    PLAYGROUND_AUTH_STATE_BEARER_TOKEN_INITIAL,
    PLAYGROUND_AUTH_STATE_HEADER_INITIAL,
    PLAYGROUND_AUTH_STATE_OAUTH_INITIAL,
    PlaygroundAuthStateBasicAuth,
    PlaygroundAuthStateBearerToken,
    PlaygroundAuthStateHeader,
    PlaygroundAuthStateOAuth,
    PlaygroundAuthStateSchema,
    type PlaygroundAuthState,
    type PlaygroundEndpointRequestFormState,
    type PlaygroundRequestFormState,
    type PlaygroundWebSocketRequestFormState,
} from "../playground/types";
import {
    getInitialEndpointRequestFormState,
    getInitialEndpointRequestFormStateWithExample,
    getInitialWebSocketRequestFormState,
} from "../playground/utils";
import { FEATURE_FLAGS_ATOM } from "./flags";
import { useAtomEffect } from "./hooks";
import { HEADER_HEIGHT_ATOM } from "./layout";
import { LOCATION_ATOM } from "./location";
import { NAVIGATION_NODES_ATOM } from "./navigation";
import { atomWithStorageValidation } from "./utils/atomWithStorageValidation";
import { IS_MOBILE_SCREEN_ATOM } from "./viewport";

const PLAYGROUND_IS_OPEN_ATOM = atom(false);
PLAYGROUND_IS_OPEN_ATOM.debugLabel = "PLAYGROUND_IS_OPEN_ATOM";

export const IS_PLAYGROUND_ENABLED_ATOM = atom((get) => get(FEATURE_FLAGS_ATOM).isApiPlaygroundEnabled);

export const MAX_PLAYGROUND_HEIGHT_ATOM = atom((get) => {
    const isMobileScreen = get(IS_MOBILE_SCREEN_ATOM);
    const headerHeight = get(HEADER_HEIGHT_ATOM);
    return isMobileScreen ? "100vh" : `calc(100vh - ${headerHeight}px)`;
});
MAX_PLAYGROUND_HEIGHT_ATOM.debugLabel = "MAX_PLAYGROUND_HEIGHT_ATOM";

const PLAYGROUND_HEIGHT_VALUE_ATOM = atom<number>(0);
PLAYGROUND_HEIGHT_VALUE_ATOM.debugLabel = "PLAYGROUND_HEIGHT_VALUE_ATOM";

PLAYGROUND_HEIGHT_VALUE_ATOM.onMount = (set) => {
    if (typeof window === "undefined") {
        return;
    }
    set(window.innerHeight);
};

export const PLAYGROUND_NODE_ID = atom(
    (get) => {
        const playgroundParam = get(LOCATION_ATOM).searchParams?.get("playground");
        if (playgroundParam == null) {
            return get(PREV_PLAYGROUND_NODE_ID);
        }
        const nodes = get(NAVIGATION_NODES_ATOM);
        // return FernNavigation.NodeId(playgroundParam);
        const node = nodes.slugMap.get(FernNavigation.slugjoin(playgroundParam));
        if (node == null || !FernNavigation.isApiLeaf(node)) {
            return get(PREV_PLAYGROUND_NODE_ID);
        }
        return node.id;
    },
    (get, set, update: FernNavigation.NodeId | undefined) => {
        const newLocation = {
            ...get(LOCATION_ATOM),
            searchParams: new URLSearchParams(get(LOCATION_ATOM).searchParams),
        };
        const node = update != null ? get(NAVIGATION_NODES_ATOM).get(update) : undefined;
        if (node != null && FernNavigation.isApiLeaf(node)) {
            // set playground open
            set(PLAYGROUND_IS_OPEN_ATOM, true);

            newLocation.searchParams.set("playground", selectHref(get, node.slug));
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

export const PLAYGROUND_AUTH_STATE_ATOM = atomWithStorageValidation<PlaygroundAuthState>(
    "playground-auth-state",
    {},
    { validate: PlaygroundAuthStateSchema, isSession: true, getOnInit: true },
);

export const PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM = atom(
    (get) => get(PLAYGROUND_AUTH_STATE_ATOM).bearerAuth ?? PLAYGROUND_AUTH_STATE_BEARER_TOKEN_INITIAL,
    (_get, set, update: SetStateAction<PlaygroundAuthStateBearerToken>) => {
        set(PLAYGROUND_AUTH_STATE_ATOM, (prev) => ({
            ...prev,
            bearerAuth:
                typeof update === "function"
                    ? update(prev.bearerAuth ?? PLAYGROUND_AUTH_STATE_BEARER_TOKEN_INITIAL)
                    : update,
        }));
    },
);

export const PLAYGROUND_AUTH_STATE_HEADER_ATOM = atom(
    (get) => get(PLAYGROUND_AUTH_STATE_ATOM).header ?? PLAYGROUND_AUTH_STATE_HEADER_INITIAL,
    (_get, set, update: SetStateAction<PlaygroundAuthStateHeader>) => {
        set(PLAYGROUND_AUTH_STATE_ATOM, (prev) => ({
            ...prev,
            header: typeof update === "function" ? update(prev.header ?? PLAYGROUND_AUTH_STATE_HEADER_INITIAL) : update,
        }));
    },
);

export const PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM = atom(
    (get) => get(PLAYGROUND_AUTH_STATE_ATOM).basicAuth ?? PLAYGROUND_AUTH_STATE_BASIC_AUTH_INITIAL,
    (_get, set, update: SetStateAction<PlaygroundAuthStateBasicAuth>) => {
        set(PLAYGROUND_AUTH_STATE_ATOM, (prev) => ({
            ...prev,
            basicAuth:
                typeof update === "function"
                    ? update(prev.basicAuth ?? PLAYGROUND_AUTH_STATE_BASIC_AUTH_INITIAL)
                    : update,
        }));
    },
);

export const PLAYGROUND_AUTH_STATE_OAUTH_ATOM = atom(
    (get) => get(PLAYGROUND_AUTH_STATE_ATOM).oauth ?? PLAYGROUND_AUTH_STATE_OAUTH_INITIAL,
    (_get, set, update: SetStateAction<PlaygroundAuthStateOAuth>) => {
        set(PLAYGROUND_AUTH_STATE_ATOM, (prev) => ({
            ...prev,
            oauth: typeof update === "function" ? update(prev.oauth ?? PLAYGROUND_AUTH_STATE_OAUTH_INITIAL) : update,
        }));
    },
);

const playgroundFormStateFamily = atomFamily((nodeId: FernNavigation.NodeId) => {
    const formStateAtom = atomWithStorage<PlaygroundRequestFormState | undefined>(nodeId, undefined, undefined, {
        getOnInit: true,
    });
    formStateAtom.debugLabel = `playground-form-state:${nodeId}`;
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

export function useSetAndOpenPlayground(): (node: FernNavigation.NavigationNodeApiLeaf) => Promise<void> {
    const preload = usePreloadApiLeaf();

    return useAtomCallback(
        useCallbackOne(
            async (get, set, node: FernNavigation.NavigationNodeApiLeaf) => {
                const formStateAtom = playgroundFormStateFamily(node.id);
                set(PLAYGROUND_NODE_ID, node.id);

                const definition = await preload(node);

                const formState = get(formStateAtom);
                if (formState != null) {
                    playgroundFormStateFamily.remove(node.id);
                    return;
                }

                if (node.type === "endpoint") {
                    const context = createEndpointContext(node, definition);

                    if (context == null) {
                        // TODO: sentry
                        // eslint-disable-next-line no-console
                        console.error("Could not find endpoint for API playground selection state");
                        return;
                    }

                    set(
                        formStateAtom,
                        getInitialEndpointRequestFormStateWithExample(context, context.endpoint.examples?.[0]),
                    );
                } else if (node.type === "webSocket") {
                    const context = createWebSocketContext(node, definition);

                    if (context == null) {
                        // TODO: sentry
                        // eslint-disable-next-line no-console
                        console.error("Could not find websocket for API playground selection state");
                        playgroundFormStateFamily.remove(node.id);
                        return;
                    }

                    set(formStateAtom, getInitialWebSocketRequestFormState(context));
                }
                playgroundFormStateFamily.remove(node.id);
            },
            [preload],
        ),
    );
}

export function usePlaygroundEndpointFormState(
    ctx: EndpointContext,
): [PlaygroundEndpointRequestFormState, Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>] {
    const formStateAtom = playgroundFormStateFamily(ctx.node.id);
    const formState = useAtomValue(formStateAtom);

    return [
        formState?.type === "endpoint" ? formState : getInitialEndpointRequestFormState(ctx),
        useAtomCallback(
            useCallbackOne(
                (get, set, update: SetStateAction<PlaygroundEndpointRequestFormState>) => {
                    const currentFormState = get(formStateAtom);
                    const newFormState =
                        typeof update === "function"
                            ? update(
                                  currentFormState?.type === "endpoint"
                                      ? currentFormState
                                      : getInitialEndpointRequestFormState(ctx),
                              )
                            : update;
                    set(formStateAtom, newFormState);
                },
                [formStateAtom, ctx],
            ),
        ),
    ];
}

export function usePlaygroundWebsocketFormState(
    context: WebSocketContext,
): [PlaygroundWebSocketRequestFormState, Dispatch<SetStateAction<PlaygroundWebSocketRequestFormState>>] {
    const formStateAtom = playgroundFormStateFamily(context.node.id);
    const formState = useAtomValue(playgroundFormStateFamily(context.node.id));

    return [
        formState?.type === "websocket" ? formState : getInitialWebSocketRequestFormState(context),
        useAtomCallback(
            useCallbackOne(
                (get, set, update: SetStateAction<PlaygroundWebSocketRequestFormState>) => {
                    const currentFormState = get(formStateAtom);
                    const newFormState =
                        typeof update === "function"
                            ? update(
                                  currentFormState?.type === "websocket"
                                      ? currentFormState
                                      : getInitialWebSocketRequestFormState(context),
                              )
                            : update;
                    set(formStateAtom, newFormState);
                },
                [formStateAtom, context],
            ),
        ),
    ];
}

export const PLAYGROUND_REQUEST_TYPE_ATOM = atomWithStorage<"curl" | "typescript" | "python">(
    "api-playground-atom-alpha",
    "curl",
);

export const PLAYGROUND_ENVIRONMENT_ATOM = atom<string | undefined>(undefined);

export const usePlaygroundEnvironment = (): string | undefined => {
    return useAtomValue(PLAYGROUND_ENVIRONMENT_ATOM);
};
