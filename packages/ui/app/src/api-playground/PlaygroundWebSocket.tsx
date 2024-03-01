import { APIV1Read } from "@fern-api/fdr-sdk";
import { Dispatch, FC, ReactElement, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { Wifi, WifiOff } from "react-feather";
import { WebSocketMessage } from "../api-page/web-socket/WebSocketMessages";
import { FernTooltipProvider } from "../components/FernTooltip";
import { ResolvedTypeDefinition, ResolvedWebSocketChannel, ResolvedWebSocketMessage } from "../util/resolver";
import { PlaygroundEndpointPath } from "./PlaygroundEndpointPath";
import { PlaygroundWebSocketContent } from "./PlaygroundWebSocketContent";
import { PlaygroundWebSocketRequestFormState } from "./types";
import { buildRequestUrl } from "./utils";

interface PlaygroundWebSocketProps {
    auth: APIV1Read.ApiAuth | null | undefined;
    websocket: ResolvedWebSocketChannel;
    formState: PlaygroundWebSocketRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundWebSocketRequestFormState>>;
    types: Record<string, ResolvedTypeDefinition>;
}

export const PlaygroundWebSocket: FC<PlaygroundWebSocketProps> = ({
    auth,
    websocket,
    formState,
    setFormState,
    types,
}): ReactElement => {
    const [connectedState, setConnectedState] = useState<"opening" | "opened" | "closed">("closed");
    const [webSocketMessages, setWebSocketMessages] = useState<WebSocketMessage[]>([]);

    const pushWebSocketMessage = useCallback((message: WebSocketMessage) => {
        setWebSocketMessages((old) => [...old, message]);
    }, []);

    const [step, setStep] = useState<"handshake" | "session">("handshake");

    const socket = useRef<WebSocket | null>(null);

    // auto-destroy the socket when the component is unmounted
    useEffect(() => () => socket.current?.close(), []);

    const startSession = useCallback(() => {
        if (socket.current != null && socket.current.readyState !== WebSocket.CLOSED) {
            socket.current.close();
        }

        setWebSocketMessages([]);

        const url = buildRequestUrl(
            websocket.defaultEnvironment?.baseUrl,
            websocket.path,
            formState.pathParameters,
            formState.queryParameters,
        );

        setConnectedState("opening");

        socket.current = new WebSocket("wss://fern-websocket-worker.danny-312.workers.dev/ws");

        socket.current.onopen = () => {
            socket.current?.send(
                JSON.stringify({
                    type: "handshake",
                    url,
                    headers: formState.headers,
                }),
            );
        };

        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "handshake" && data.status === "connected") {
                setConnectedState("opened");
                setStep("session");
            } else if (data.type === "data") {
                pushWebSocketMessage({
                    type: "received",
                    data: typeof data.data === "string" ? JSON.parse(data.data) : data.data,
                    origin: "server",
                    displayName: undefined,
                });
            }
        };

        socket.current.onclose = () => {
            setConnectedState("closed");
        };

        socket.current.onerror = (event) => {
            // eslint-disable-next-line no-console
            console.error(event);
        };
    }, [
        formState.headers,
        formState.pathParameters,
        formState.queryParameters,
        pushWebSocketMessage,
        websocket.defaultEnvironment?.baseUrl,
        websocket.path,
    ]);

    const handleSendMessage = useCallback(
        (message: ResolvedWebSocketMessage, data: unknown) => {
            if (socket.current != null && socket.current.readyState === WebSocket.OPEN) {
                socket.current.send(JSON.stringify(data));
                pushWebSocketMessage({
                    type: message.type,
                    data,
                    origin: "client",
                    displayName: message.displayName,
                });
            }
        },
        [pushWebSocketMessage],
    );

    return (
        <FernTooltipProvider>
            <div className="flex min-h-0 flex-1 shrink flex-col">
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
                        auth={auth}
                        websocket={websocket}
                        formState={formState}
                        setFormState={setFormState}
                        messages={webSocketMessages}
                        types={types}
                        step={step}
                        sendMessage={handleSendMessage}
                        startSesssion={startSession}
                        returnToHandshake={useCallback(() => setStep("handshake"), [])}
                        connected={connectedState === "opened"}
                    />
                </div>
            </div>
        </FernTooltipProvider>
    );
};
