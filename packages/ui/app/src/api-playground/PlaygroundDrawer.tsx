import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { EMPTY_OBJECT, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { Portal, Transition } from "@headlessui/react";
import { Cross1Icon } from "@radix-ui/react-icons";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { atom, useAtom } from "jotai";
import { mapValues } from "lodash-es";
import { Dispatch, FC, SetStateAction, useCallback, useEffect } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { FernButton, FernButtonGroup } from "../components/FernButton";
import { FernTooltip, FernTooltipProvider } from "../components/FernTooltip";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { SidebarNode } from "../sidebar/types";
import {
    FlattenedRootPackage,
    isEndpoint,
    isWebSocket,
    ResolvedApiDefinition,
    ResolvedEndpointDefinition,
    ResolvedExampleEndpointCall,
    ResolvedTypeDefinition,
    ResolvedWebSocketChannel,
} from "../util/resolver";
import { PLAYGROUND_FORM_STATE_ATOM, PLAYGROUND_OPEN_ATOM, usePlaygroundContext } from "./PlaygroundContext";
import { PlaygroundEndpoint } from "./PlaygroundEndpoint";
import { PlaygroundEndpointSelector } from "./PlaygroundEndpointSelector";
import { PlaygroundEndpointSelectorContent } from "./PlaygroundEndpointSelectorContent";
import { PlaygroundWebSocket } from "./PlaygroundWebSocket";
import {
    PlaygroundEndpointRequestFormState,
    PlaygroundFormDataEntryValue,
    PlaygroundRequestFormAuth,
    PlaygroundWebSocketRequestFormState,
} from "./types";
import { useVerticalSplitPane, useWindowHeight } from "./useSplitPlane";
import { getDefaultValueForObjectProperties, getDefaultValueForType, getDefaultValuesForBody } from "./utils";

export type PlaygroundSelectionState = PlaygroundSelectionStateEndpoint | PlaygroundSelectionStateWebSocket;
export interface PlaygroundSelectionStateEndpoint {
    type: "endpoint";
    api: FdrAPI.ApiId;
    endpointId: APIV1Read.EndpointId;
}

export interface PlaygroundSelectionStateWebSocket {
    type: "websocket";
    api: FdrAPI.ApiId;
    webSocketId: APIV1Read.WebSocketId;
}

const EMPTY_ENDPOINT_FORM_STATE: PlaygroundEndpointRequestFormState = {
    type: "endpoint",
    auth: undefined,
    headers: {},
    pathParameters: {},
    queryParameters: {},
    body: undefined,
};

const EMPTY_WEBSOCKET_FORM_STATE: PlaygroundWebSocketRequestFormState = {
    type: "websocket",

    auth: undefined,
    headers: {},
    pathParameters: {},
    queryParameters: {},

    messages: {},
};

export const PLAYGROUND_HEIGHT_ATOM = atom<number>(0);

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
        windowHeight != null ? Math.max(Math.min(windowHeight - headerHeight, playgroundHeight), 40) : playgroundHeight;

    return [height, setHeight];
}

interface PlaygroundDrawerProps {
    navigation: SidebarNode[];
    apis: Record<string, FlattenedRootPackage>;
}

export const PlaygroundDrawer: FC<PlaygroundDrawerProps> = ({ navigation, apis }) => {
    const { selectionState, hasPlayground, collapsePlayground } = usePlaygroundContext();
    const windowHeight = useWindowHeight();

    const matchedSection = selectionState != null ? apis[selectionState.api] : undefined;

    const types = matchedSection?.types ?? EMPTY_OBJECT;

    const [height, setHeight] = usePlaygroundHeight();

    const setOffset = useCallback(
        (offset: number) => {
            windowHeight != null && setHeight(windowHeight - offset);
        },
        [setHeight, windowHeight],
    );

    const handleVerticalResize = useVerticalSplitPane(setOffset);

    const [isPlaygroundOpen, setPlaygroundOpen] = useAtom(PLAYGROUND_OPEN_ATOM);
    const [globalFormState, setGlobalFormState] = useAtom(PLAYGROUND_FORM_STATE_ATOM);

    const setPlaygroundEndpointFormState = useCallback<Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>>(
        (newFormState) => {
            if (selectionState == null) {
                return;
            }
            setGlobalFormState((currentGlobalFormState) => {
                let currentFormState = currentGlobalFormState[createFormStateKey(selectionState)];
                if (currentFormState == null || currentFormState.type !== "endpoint") {
                    currentFormState = EMPTY_ENDPOINT_FORM_STATE;
                }
                const mutatedFormState =
                    typeof newFormState === "function" ? newFormState(currentFormState) : newFormState;
                return {
                    ...currentGlobalFormState,
                    [createFormStateKey(selectionState)]: mutatedFormState,
                };
            });
        },
        [selectionState, setGlobalFormState],
    );

    const setPlaygroundWebSocketFormState = useCallback<Dispatch<SetStateAction<PlaygroundWebSocketRequestFormState>>>(
        (newFormState) => {
            if (selectionState == null) {
                return;
            }
            setGlobalFormState((currentGlobalFormState) => {
                let currentFormState = currentGlobalFormState[createFormStateKey(selectionState)];
                if (currentFormState == null || currentFormState.type !== "websocket") {
                    currentFormState = EMPTY_WEBSOCKET_FORM_STATE;
                }
                const mutatedFormState =
                    typeof newFormState === "function" ? newFormState(currentFormState) : newFormState;
                return {
                    ...currentGlobalFormState,
                    [createFormStateKey(selectionState)]: mutatedFormState,
                };
            });
        },
        [selectionState, setGlobalFormState],
    );

    const playgroundFormState =
        selectionState != null ? globalFormState[createFormStateKey(selectionState)] : undefined;

    const togglePlayground = useCallback(
        (usingKeyboardShortcut: boolean) => {
            return setPlaygroundOpen((current) => {
                if (!current) {
                    capturePosthogEvent("api_playground_opened", { usingKeyboardShortcut });
                }
                return !current;
            });
        },
        [setPlaygroundOpen],
    );

    const matchedEndpoint =
        selectionState?.type === "endpoint"
            ? (matchedSection?.apiDefinitions.find(
                  (definition) => isEndpoint(definition) && definition.slug.join("/") === selectionState.endpointId,
              ) as ResolvedApiDefinition.Endpoint | undefined)
            : undefined;

    const matchedWebSocket =
        selectionState?.type === "websocket"
            ? (matchedSection?.apiDefinitions.find(
                  (definition) => isWebSocket(definition) && definition.slug.join("/") === selectionState.webSocketId,
              ) as ResolvedApiDefinition.WebSocket | undefined)
            : undefined;

    const resetWithExample = useCallback(() => {
        if (selectionState?.type === "endpoint") {
            setPlaygroundEndpointFormState(
                getInitialEndpointRequestFormStateWithExample(
                    matchedSection?.auth,
                    matchedEndpoint,
                    matchedEndpoint?.examples[0],
                    types,
                ),
            );
        } else if (selectionState?.type === "websocket") {
            setPlaygroundWebSocketFormState(
                getInitialWebSocketRequestFormState(matchedSection?.auth, matchedWebSocket, types),
            );
        }
    }, [
        matchedEndpoint,
        matchedSection?.auth,
        matchedWebSocket,
        selectionState?.type,
        setPlaygroundEndpointFormState,
        setPlaygroundWebSocketFormState,
        types,
    ]);

    const resetWithoutExample = useCallback(() => {
        if (selectionState?.type === "endpoint") {
            setPlaygroundEndpointFormState(
                getInitialEndpointRequestFormState(matchedSection?.auth, matchedEndpoint, types),
            );
        } else if (selectionState?.type === "websocket") {
            setPlaygroundWebSocketFormState(
                getInitialWebSocketRequestFormState(matchedSection?.auth, matchedWebSocket, types),
            );
        }
    }, [
        matchedEndpoint,
        matchedSection?.auth,
        matchedWebSocket,
        selectionState?.type,
        setPlaygroundEndpointFormState,
        setPlaygroundWebSocketFormState,
        types,
    ]);

    useEffect(() => {
        // if keyboard press "ctrl + `", open playground
        const togglePlaygroundHandler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "`") {
                togglePlayground(true);
            }
        };
        document.addEventListener("keydown", togglePlaygroundHandler, false);
        return () => {
            document.removeEventListener("keydown", togglePlaygroundHandler, false);
        };
    }, [togglePlayground]);

    if (!hasPlayground) {
        return null;
    }

    return (
        <Portal>
            <Transition
                show={isPlaygroundOpen}
                className="bg-background-translucent border-default max-h-vh-minus-header fixed inset-x-0 bottom-0 border-t backdrop-blur-xl"
                style={{ height }}
                enter="ease-out transition-transform duration-300 transform"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="ease-in transition-transform duration-200 transform"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
            >
                <div
                    className="group absolute inset-x-0 -top-0.5 h-0.5 cursor-row-resize after:absolute after:inset-x-0 after:-top-3 after:h-4 after:content-['']"
                    onMouseDown={handleVerticalResize}
                >
                    <div className="bg-accent absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100" />
                    <div className="relative -top-6 z-30 mx-auto w-fit p-4 pb-0">
                        <div className="bg-accent h-1 w-10 rounded-full" />
                    </div>
                </div>
                <div className="flex h-full flex-col rounded-lg">
                    <div>
                        <div className="grid h-10 grid-cols-3 gap-2 px-4">
                            <div className="flex items-center">
                                <span className="inline-flex items-baseline gap-2">
                                    <span className="t-accent text-sm font-semibold">API Playground</span>
                                    <span className="bg-tag-primary t-accent flex h-5 items-center rounded-md px-1.5 py-1 font-mono text-xs uppercase">
                                        BETA
                                    </span>
                                </span>
                            </div>

                            <div className="flex items-center justify-center">
                                {selectionState != null ? (
                                    <PlaygroundEndpointSelector navigation={navigation} />
                                ) : (
                                    <h6 className="t-accent">Select an endpoint to get started</h6>
                                )}
                            </div>

                            <div className="flex items-center justify-end">
                                <FernTooltipProvider>
                                    <FernButtonGroup>
                                        <FernTooltip
                                            content={
                                                <span className="space-x-4">
                                                    <span>Close API Playground</span>
                                                    <span className="text-faded font-mono">CTRL + `</span>
                                                </span>
                                            }
                                        >
                                            <FernButton
                                                variant="minimal"
                                                className="-mr-2"
                                                icon={<Cross1Icon />}
                                                onClick={collapsePlayground}
                                                rounded
                                            />
                                        </FernTooltip>
                                    </FernButtonGroup>
                                </FernTooltipProvider>
                            </div>
                        </div>
                    </div>
                    {selectionState?.type === "endpoint" && matchedEndpoint != null ? (
                        <PlaygroundEndpoint
                            endpoint={matchedEndpoint}
                            formState={
                                playgroundFormState?.type === "endpoint"
                                    ? playgroundFormState
                                    : EMPTY_ENDPOINT_FORM_STATE
                            }
                            setFormState={setPlaygroundEndpointFormState}
                            resetWithExample={resetWithExample}
                            resetWithoutExample={resetWithoutExample}
                            types={types}
                        />
                    ) : selectionState?.type === "websocket" && matchedWebSocket != null ? (
                        <PlaygroundWebSocket
                            websocket={matchedWebSocket}
                            formState={
                                playgroundFormState?.type === "websocket"
                                    ? playgroundFormState
                                    : EMPTY_WEBSOCKET_FORM_STATE
                            }
                            setFormState={setPlaygroundWebSocketFormState}
                            types={types}
                        />
                    ) : (
                        <TooltipProvider>
                            <div className="flex min-h-0 flex-1 shrink flex-col items-center justify-start">
                                <PlaygroundEndpointSelectorContent
                                    navigation={navigation}
                                    className="fern-card mb-6 min-h-0 shrink p-px"
                                />
                            </div>
                        </TooltipProvider>
                    )}
                </div>
            </Transition>
        </Portal>
    );
};

function getInitialEndpointRequestFormState(
    auth: APIV1Read.ApiAuth | null | undefined,
    endpoint: ResolvedEndpointDefinition | undefined,
    types: Record<string, ResolvedTypeDefinition>,
): PlaygroundEndpointRequestFormState {
    return {
        type: "endpoint",
        auth: getInitialAuthState(auth),
        headers: getDefaultValueForObjectProperties(endpoint?.headers, types),
        pathParameters: getDefaultValueForObjectProperties(endpoint?.pathParameters, types),
        queryParameters: getDefaultValueForObjectProperties(endpoint?.queryParameters, types),
        body: getDefaultValuesForBody(endpoint?.requestBody[0]?.shape, types),
    };
}

function getInitialWebSocketRequestFormState(
    auth: APIV1Read.ApiAuth | null | undefined,
    webSocket: ResolvedWebSocketChannel | undefined,
    types: Record<string, ResolvedTypeDefinition>,
): PlaygroundWebSocketRequestFormState {
    return {
        type: "websocket",

        auth: getInitialAuthState(auth),
        headers: getDefaultValueForObjectProperties(webSocket?.headers, types),
        pathParameters: getDefaultValueForObjectProperties(webSocket?.pathParameters, types),
        queryParameters: getDefaultValueForObjectProperties(webSocket?.queryParameters, types),

        messages: Object.fromEntries(
            webSocket?.messages.map((message) => [message.type, getDefaultValueForType(message.body, types)]) ?? [],
        ),
    };
}

function getInitialAuthState(auth: APIV1Read.ApiAuth | null | undefined): PlaygroundRequestFormAuth | undefined {
    if (auth == null) {
        return undefined;
    }
    return visitDiscriminatedUnion(auth, "type")._visit<PlaygroundRequestFormAuth | undefined>({
        header: (header) => ({ type: "header", headers: { [header.headerWireValue]: "" } }),
        bearerAuth: () => ({ type: "bearerAuth", token: "" }),
        basicAuth: () => ({ type: "basicAuth", username: "", password: "" }),
        _other: () => undefined,
    });
}

export function getInitialEndpointRequestFormStateWithExample(
    auth: APIV1Read.ApiAuth | null | undefined,
    endpoint: ResolvedEndpointDefinition | undefined,
    exampleCall: ResolvedExampleEndpointCall | undefined,
    types: Record<string, ResolvedTypeDefinition>,
): PlaygroundEndpointRequestFormState {
    if (exampleCall == null) {
        return getInitialEndpointRequestFormState(auth, endpoint, types);
    }
    return {
        type: "endpoint",
        auth: getInitialAuthState(auth),
        headers: exampleCall.headers,
        pathParameters: exampleCall.pathParameters,
        queryParameters: exampleCall.queryParameters,
        body:
            exampleCall.requestBody?.type === "form"
                ? {
                      type: "form-data",
                      value: mapValues(
                          exampleCall.requestBody.value,
                          (exampleValue): PlaygroundFormDataEntryValue =>
                              exampleValue.type === "file"
                                  ? { type: "file", value: undefined }
                                  : exampleValue.type === "fileArray"
                                    ? { type: "fileArray", value: [] }
                                    : { type: "json", value: exampleValue.value },
                      ),
                  }
                : exampleCall.requestBody?.type === "stream"
                  ? {
                        type: "octet-stream",
                        value: undefined,
                    }
                  : { type: "json", value: exampleCall.requestBody?.value },
    };
}

export function createFormStateKey(state: PlaygroundSelectionState): string {
    return `${state.api}/${state.type}/${state.type === "endpoint" ? state.endpointId : state.webSocketId}`;
}
