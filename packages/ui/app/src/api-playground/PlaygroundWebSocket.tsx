import { FernTooltipProvider } from "@fern-ui/components";
import { usePrevious } from "@fern-ui/react-commons";
import { merge } from "lodash-es";
import { Dispatch, FC, ReactElement, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { Wifi, WifiOff } from "react-feather";
import { ResolvedTypeDefinition, ResolvedWebSocketChannel, ResolvedWebSocketMessage } from "../resolver/types";
import { PlaygroundEndpointPath } from "./PlaygroundEndpointPath";
import { PlaygroundWebSocketContent } from "./PlaygroundWebSocketContent";
import { useWebsocketMessages } from "./hooks/useWebsocketMessages";
import { PlaygroundWebSocketRequestFormState } from "./types";
import { buildRequestUrl, buildUnredactedHeadersWebsocket, getDefaultValueForType } from "./utils";

// TODO: decide if this should be an env variable, and if we should move REST proxy to the same (or separate) cloudflare worker
const WEBSOCKET_PROXY_URI = "wss://websocket.proxy.ferndocs.com/ws";

interface PlaygroundWebSocketProps {
    websocket: ResolvedWebSocketChannel;
    formState: PlaygroundWebSocketRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundWebSocketRequestFormState>>;
    types: Record<string, ResolvedTypeDefinition>;
}

export const PlaygroundWebSocket: FC<PlaygroundWebSocketProps> = ({
    websocket,
    formState,
    setFormState,
    types,
}): ReactElement => {
    const [connectedState, setConnectedState] = useState<"opening" | "opened" | "closed">("closed");
    const { messages, pushMessage, clearMessages } = useWebsocketMessages(websocket.id);
    const [error, setError] = useState<string | null>(null);

    const socket = useRef<WebSocket | null>(null);

    // close the socket when the websocket changes
    const prevWebsocket = usePrevious(websocket);
    useEffect(() => {
        if (prevWebsocket.id !== websocket.id) {
            socket.current?.close();
            setError(null);
        }
    }, [prevWebsocket.id, websocket.id]);

    // auto-destroy the socket when the component is unmounted
    useEffect(() => () => socket.current?.close(), []);

    const startSession = useCallback(async () => {
        return new Promise<boolean>((resolve) => {
            if (socket.current != null && socket.current.readyState !== WebSocket.CLOSED) {
                resolve(true);
                return;
            }

            setError(null);

            const url = buildRequestUrl(
                websocket.defaultEnvironment?.baseUrl,
                websocket.path,
                formState.pathParameters,
                formState.queryParameters,
            );

            setConnectedState("opening");

            socket.current = new WebSocket(WEBSOCKET_PROXY_URI);

            socket.current.onopen = () => {
                socket.current?.send(
                    JSON.stringify({
                        type: "handshake",
                        url,
                        headers: buildUnredactedHeadersWebsocket(websocket, formState),
                    }),
                );
            };

            socket.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "handshake" && data.status === "connected") {
                    setConnectedState("opened");
                    resolve(true);
                } else if (data.type === "data") {
                    pushMessage({
                        type: "received",
                        data: typeof data.data === "string" ? JSON.parse(data.data) : data.data,
                        origin: "server",
                        displayName: undefined,
                    });
                }
            };

            socket.current.onclose = (ev) => {
                setConnectedState("closed");
                resolve(false);

                if (ev.code !== 1000) {
                    setError(ev.reason);
                }
            };

            socket.current.onerror = (event) => {
                // eslint-disable-next-line no-console
                console.error(event);
            };
        });
    }, [formState, pushMessage, websocket]);

    const handleSendMessage = useCallback(
        async (message: ResolvedWebSocketMessage, data: unknown) => {
            const isConnected = await startSession();
            if (isConnected && socket.current != null && socket.current.readyState === WebSocket.OPEN) {
                // TODO: handle validation
                const defaultValue = getDefaultValueForType(message.body, types);
                data = merge(defaultValue, data);
                socket.current.send(JSON.stringify(data));
                pushMessage({
                    type: message.type,
                    data,
                    origin: "client",
                    displayName: message.displayName,
                });
            }
        },
        [pushMessage, startSession, types],
    );
    return (
        <FernTooltipProvider>
            <div className="flex min-h-0 flex-1 shrink flex-col h-full">
                <div className="flex-0">
                    <PlaygroundEndpointPath
                        method={undefined}
                        formState={formState}
                        sendRequest={() =>
                            connectedState === "closed"
                                ? startSession()
                                : connectedState === "opened"
                                  ? socket.current?.close()
                                  : null
                        }
                        environment={websocket.defaultEnvironment ?? websocket.environments[0]}
                        path={websocket.path}
                        queryParameters={websocket.queryParameters}
                        sendRequestButtonLabel={
                            connectedState === "closed"
                                ? "Connect"
                                : connectedState === "opening"
                                  ? "Connecting..."
                                  : "Disconnect"
                        }
                        sendRequestIcon={
                            connectedState === "opening" ? null : connectedState === "opened" ? (
                                <WifiOff className="size-6 rotate-90" />
                            ) : (
                                <Wifi className="size-6 rotate-90" />
                            )
                        }
                    />
                </div>
                <div className="flex min-h-0 flex-1 shrink">
                    <PlaygroundWebSocketContent
                        websocket={websocket}
                        formState={formState}
                        setFormState={setFormState}
                        messages={messages}
                        types={types}
                        sendMessage={handleSendMessage}
                        startSesssion={startSession}
                        clearMessages={clearMessages}
                        connected={connectedState === "opened"}
                        error={error}
                    />
                </div>
            </div>
        </FernTooltipProvider>
    );
};
