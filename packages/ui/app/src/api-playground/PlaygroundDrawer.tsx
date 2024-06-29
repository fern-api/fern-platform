import { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { FernButton } from "@fern-ui/components";
import { EMPTY_OBJECT, visitDiscriminatedUnion } from "@fern-ui/core-utils";
// import { Portal, Transition } from "@headlessui/react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeftIcon, Cross1Icon } from "@radix-ui/react-icons";
import { motion, useAnimate, useMotionValue } from "framer-motion";
import { atom, useAtom } from "jotai";
import { mapValues } from "lodash-es";
import { Dispatch, FC, SetStateAction, useCallback, useEffect, useMemo } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useLayoutBreakpointValue } from "../contexts/layout-breakpoint/useLayoutBreakpoint";
import {
    FlattenedRootPackage,
    ResolvedApiDefinition,
    ResolvedEndpointDefinition,
    ResolvedExampleEndpointCall,
    ResolvedTypeDefinition,
    ResolvedWebSocketChannel,
    isEndpoint,
    isWebSocket,
} from "../resolver/types";
import { PLAYGROUND_FORM_STATE_ATOM, PLAYGROUND_OPEN_ATOM, usePlaygroundContext } from "./PlaygroundContext";
import { PlaygroundEndpoint } from "./PlaygroundEndpoint";
import { PlaygroundEndpointSelectorContent, flattenApiSection } from "./PlaygroundEndpointSelectorContent";
import { PlaygroundWebSocket } from "./PlaygroundWebSocket";
import { HorizontalSplitPane } from "./VerticalSplitPane";
import {
    PlaygroundEndpointRequestFormState,
    PlaygroundFormDataEntryValue,
    PlaygroundRequestFormAuth,
    PlaygroundWebSocketRequestFormState,
} from "./types";
import { useVerticalSplitPane, useWindowHeight } from "./useSplitPlane";
import { getDefaultValueForObjectProperties, getDefaultValueForType, getDefaultValuesForBody } from "./utils";

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
        windowHeight != null
            ? Math.max(Math.min(windowHeight - headerHeight, playgroundHeight), windowHeight / 3)
            : playgroundHeight;

    return [height, setHeight];
}

interface PlaygroundDrawerProps {
    apis: Record<string, FlattenedRootPackage>;
}

export const PlaygroundDrawer: FC<PlaygroundDrawerProps> = ({ apis }) => {
    const { selectionState, hasPlayground, collapsePlayground } = usePlaygroundContext();
    const windowHeight = useWindowHeight();

    const { sidebar } = useDocsContext();
    const apiGroups = useMemo(() => flattenApiSection(sidebar), [sidebar]);

    const matchedSection = selectionState != null ? apis[selectionState.apiDefinitionId] : undefined;

    const nodeIdToApiDefinition = useMemo(() => {
        const nodes = new Map<FernNavigation.NodeId, ResolvedApiDefinition>();
        Object.values(apis).forEach((api) => {
            api.apiDefinitions.forEach((apiDefinition) => {
                nodes.set(apiDefinition.nodeId, apiDefinition);
            });
        });
        return nodes;
    }, [apis]);

    const types = matchedSection?.types ?? EMPTY_OBJECT;

    const layoutBreakpoint = useLayoutBreakpointValue();
    const [height, setHeight] = usePlaygroundHeight();

    const x = useMotionValue(layoutBreakpoint !== "mobile" ? height : windowHeight);
    const [scope, animate] = useAnimate();

    const setOffset = useCallback(
        (offset: number) => {
            windowHeight != null && setHeight(windowHeight - offset);
        },
        [setHeight, windowHeight],
    );

    const { handleVerticalResize, isResizing } = useVerticalSplitPane(setOffset);

    useEffect(() => {
        if (isResizing) {
            x.jump(layoutBreakpoint !== "mobile" ? height : windowHeight, true);
        } else {
            if (scope.current != null) {
                // x.setWithVelocity(layoutBreakpoint !== "mobile" ? height : windowHeight, 0);
                void animate(scope.current, { height: layoutBreakpoint !== "mobile" ? height : windowHeight });
            } else {
                x.jump(layoutBreakpoint !== "mobile" ? height : windowHeight, true);
            }
        }
    }, [animate, height, isResizing, layoutBreakpoint, scope, windowHeight, x]);

    const [isPlaygroundOpen, setPlaygroundOpen] = useAtom(PLAYGROUND_OPEN_ATOM);
    const [globalFormState, setGlobalFormState] = useAtom(PLAYGROUND_FORM_STATE_ATOM);

    const setPlaygroundEndpointFormState = useCallback<Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>>(
        (newFormState) => {
            if (selectionState == null) {
                return;
            }
            setGlobalFormState((currentGlobalFormState) => {
                let currentFormState = currentGlobalFormState[selectionState.id];
                if (currentFormState == null || currentFormState.type !== "endpoint") {
                    currentFormState = EMPTY_ENDPOINT_FORM_STATE;
                }
                const mutatedFormState =
                    typeof newFormState === "function" ? newFormState(currentFormState) : newFormState;
                return {
                    ...currentGlobalFormState,
                    [selectionState.id]: mutatedFormState,
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
                let currentFormState = currentGlobalFormState[selectionState.id];
                if (currentFormState == null || currentFormState.type !== "websocket") {
                    currentFormState = EMPTY_WEBSOCKET_FORM_STATE;
                }
                const mutatedFormState =
                    typeof newFormState === "function" ? newFormState(currentFormState) : newFormState;
                return {
                    ...currentGlobalFormState,
                    [selectionState.id]: mutatedFormState,
                };
            });
        },
        [selectionState, setGlobalFormState],
    );

    const playgroundFormState = selectionState != null ? globalFormState[selectionState.id] : undefined;

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
                  (definition) => isEndpoint(definition) && definition.id === selectionState.endpointId,
              ) as ResolvedApiDefinition.Endpoint | undefined)
            : undefined;

    const matchedWebSocket =
        selectionState?.type === "webSocket"
            ? (matchedSection?.apiDefinitions.find(
                  (definition) => isWebSocket(definition) && definition.id === selectionState.webSocketId,
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
        } else if (selectionState?.type === "webSocket") {
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
        } else if (selectionState?.type === "webSocket") {
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

    const { endpoint: selectedEndpoint } = apiGroups
        .flatMap((group) => [...group.items.map((endpoint) => ({ group, endpoint }))])
        .find(({ endpoint }) => endpoint.id === selectionState?.id) ?? {
        endpoint: undefined,
        group: undefined,
    };

    if (!hasPlayground || apiGroups.length === 0) {
        return null;
    }

    const renderContent = () =>
        selectionState?.type === "endpoint" && matchedEndpoint != null ? (
            <PlaygroundEndpoint
                endpoint={matchedEndpoint}
                formState={playgroundFormState?.type === "endpoint" ? playgroundFormState : EMPTY_ENDPOINT_FORM_STATE}
                setFormState={setPlaygroundEndpointFormState}
                resetWithExample={resetWithExample}
                resetWithoutExample={resetWithoutExample}
                types={types}
            />
        ) : selectionState?.type === "webSocket" && matchedWebSocket != null ? (
            <PlaygroundWebSocket
                websocket={matchedWebSocket}
                formState={playgroundFormState?.type === "websocket" ? playgroundFormState : EMPTY_WEBSOCKET_FORM_STATE}
                setFormState={setPlaygroundWebSocketFormState}
                types={types}
            />
        ) : (
            <div className="size-full flex flex-col items-center justify-center">
                <ArrowLeftIcon className="size-8 mb-2 t-muted" />
                <h6 className="t-muted">Select an endpoint to get started</h6>
            </div>
        );

    const renderMobileHeader = () => (
        <div className="grid h-10 grid-cols-2 gap-2 px-4">
            <div className="flex items-center">
                <span className="inline-flex items-baseline gap-2">
                    <span className="t-accent text-sm font-semibold">API Playground</span>
                </span>
            </div>

            <div className="flex items-center justify-end">
                <FernButton
                    variant="minimal"
                    className="-mr-3"
                    icon={<Cross1Icon />}
                    onClick={collapsePlayground}
                    rounded
                />
            </div>
        </div>
    );

    return (
        <FernErrorBoundary
            component="PlaygroundDrawer"
            className="flex h-full items-center justify-center"
            showError={true}
            reset={resetWithoutExample}
        >
            <Dialog.Root open={isPlaygroundOpen} onOpenChange={setPlaygroundOpen} modal={false}>
                <Dialog.Portal>
                    <Dialog.Content
                        className="data-[state=open]:animate-content-show-from-bottom fixed bottom-0 inset-x-0 bg-background-translucent backdrop-blur-2xl shadow-xl border-t border-default max-sm:h-full"
                        onInteractOutside={(e) => {
                            e.preventDefault();
                        }}
                        asChild
                    >
                        <motion.div style={{ height: x }} ref={scope}>
                            {layoutBreakpoint !== "mobile" ? (
                                <>
                                    <div
                                        className="group absolute inset-x-0 -top-0.5 h-0.5 cursor-row-resize after:absolute after:inset-x-0 after:-top-3 after:h-4 after:content-['']"
                                        onMouseDown={handleVerticalResize}
                                    >
                                        <div className="bg-accent absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100" />
                                        <div className="relative -top-6 z-30 mx-auto w-fit p-4 pb-0">
                                            <div className="bg-accent h-1 w-10 rounded-full" />
                                        </div>
                                    </div>
                                    <Dialog.Close asChild className="absolute -translate-y-full -top-2 right-2">
                                        <FernButton icon={<Cross1Icon />} size="large" rounded variant="minimal" />
                                    </Dialog.Close>
                                </>
                            ) : (
                                renderMobileHeader()
                            )}
                            {layoutBreakpoint === "mobile" || layoutBreakpoint === "sm" || layoutBreakpoint === "md" ? (
                                renderContent()
                            ) : (
                                <HorizontalSplitPane
                                    mode="pixel"
                                    className="size-full"
                                    leftClassName="border-default border-r"
                                >
                                    <PlaygroundEndpointSelectorContent
                                        apiGroups={apiGroups}
                                        selectedEndpoint={selectedEndpoint}
                                        className="h-full"
                                        nodeIdToApiDefinition={nodeIdToApiDefinition}
                                    />

                                    {renderContent()}
                                </HorizontalSplitPane>
                            )}
                        </motion.div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </FernErrorBoundary>
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
        body: getDefaultValuesForBody(endpoint?.requestBody?.shape, types),
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
                : exampleCall.requestBody?.type === "bytes"
                  ? {
                        type: "octet-stream",
                        value: undefined,
                    }
                  : { type: "json", value: exampleCall.requestBody?.value },
    };
}
