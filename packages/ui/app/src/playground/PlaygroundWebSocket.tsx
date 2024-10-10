import { WebSocketMessage, buildRequestUrl } from "@fern-api/fdr-sdk/api-definition";
import { FernTooltipProvider } from "@fern-ui/components";
import { usePrevious } from "@fern-ui/react-commons";
import { Wifi, WifiOff } from "iconoir-react";
import { FC, ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { PLAYGROUND_AUTH_STATE_ATOM, store, usePlaygroundWebsocketFormState } from "../atoms";
import { usePlaygroundSettings } from "../hooks/usePlaygroundSettings";
import { PlaygroundWebSocketContent } from "./PlaygroundWebSocketContent";
import { PlaygroundEndpointPath } from "./endpoint/PlaygroundEndpointPath";
import { useWebsocketMessages } from "./hooks/useWebsocketMessages";
import { WebSocketContext } from "./types/endpoint-context";
import { buildAuthHeaders } from "./utils";
import { usePlaygroundBaseUrl, useSelectedEnvironment } from "./utils/select-environment";

// TODO: decide if this should be an env variable, and if we should move REST proxy to the same (or separate) cloudflare worker
const WEBSOCKET_PROXY_URI = "wss://websocket.proxy.ferndocs.com/ws";

interface PlaygroundWebSocketProps {
    context: WebSocketContext;
}

export const PlaygroundWebSocket: FC<PlaygroundWebSocketProps> = ({ context }): ReactElement => {
    const [formState, setFormState] = usePlaygroundWebsocketFormState(context);

    const [connectedState, setConnectedState] = useState<"opening" | "opened" | "closed">("closed");
    const { messages, pushMessage, clearMessages } = useWebsocketMessages(context.channel.id);
    const [error, setError] = useState<string | null>(null);

    const socket = useRef<WebSocket | null>(null);

    // close the socket when the websocket changes
    const prevWebsocket = usePrevious(context.channel);
    useEffect(() => {
        if (prevWebsocket.id !== context.channel.id) {
            socket.current?.close();
            setError(null);
        }
    }, [context.channel.id, prevWebsocket.id]);

    // auto-destroy the socket when the component is unmounted
    useEffect(() => () => socket.current?.close(), []);

    const settings = usePlaygroundSettings();

    const baseUrl = usePlaygroundBaseUrl(context.channel);

    // TODO: is this is kind of weird that we're using the selected environment here?
    const selectedEnvironment = useSelectedEnvironment(context.channel);

    const startSession = useCallback(async () => {
        return new Promise<boolean>((resolve) => {
            if (socket.current != null && socket.current.readyState !== WebSocket.CLOSED) {
                resolve(true);
                return;
            }

            setError(null);

            const url = buildRequestUrl({
                baseUrl,
                path: context.channel.path,
                pathParameters: formState.pathParameters,
                queryParameters: formState.queryParameters,
            });

            setConnectedState("opening");

            socket.current = new WebSocket(WEBSOCKET_PROXY_URI);

            socket.current.onopen = () => {
                const authState = store.get(PLAYGROUND_AUTH_STATE_ATOM);
                const authHeaders = buildAuthHeaders(context.auth, authState, { redacted: false });
                const headers = {
                    ...authHeaders,
                    ...formState.headers,
                };

                socket.current?.send(JSON.stringify({ type: "handshake", url, headers }));
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
    }, [
        baseUrl,
        context.channel.path,
        context.auth,
        formState.pathParameters,
        formState.queryParameters,
        formState.headers,
        pushMessage,
    ]);

    const handleSendMessage = useCallback(
        async (message: WebSocketMessage, data: unknown) => {
            const isConnected = await startSession();
            if (isConnected && socket.current != null && socket.current.readyState === WebSocket.OPEN) {
                // TODO: handle validation
                socket.current.send(JSON.stringify(data));
                pushMessage({
                    type: message.type,
                    data,
                    origin: "client",
                    displayName: message.displayName,
                });
            }
        },
        [pushMessage, startSession],
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
                        environment={selectedEnvironment}
                        environmentFilters={settings?.environments}
                        path={context.channel.path}
                        queryParameters={context.channel.queryParameters}
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
                        context={context}
                        formState={formState}
                        setFormState={setFormState}
                        messages={messages}
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
