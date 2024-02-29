import { APIV1Read } from "@fern-api/fdr-sdk";
import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";
import { WebSocketMessage } from "../api-page/web-socket/WebSocketMessages";
import { ResolvedTypeDefinition, ResolvedWebSocketChannel, ResolvedWebSocketMessage } from "../util/resolver";
import { PlaygroundWebSocketHandshakeForm } from "./PlaygroundWebSocketHandshakeForm";
import { PlaygroundWebSocketSessionForm } from "./PlaygroundWebSocketSessionForm";
import { PlaygroundWebSocketRequestFormState } from "./types";

interface PlaygroundWebSocketContentProps {
    auth: APIV1Read.ApiAuth | null | undefined;
    websocket: ResolvedWebSocketChannel;
    formState: PlaygroundWebSocketRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundWebSocketRequestFormState>>;
    messages: WebSocketMessage[];
    types: Record<string, ResolvedTypeDefinition>;
    step: "handshake" | "session";
    startSesssion: () => void;
    sendMessage: (message: ResolvedWebSocketMessage, data: unknown) => void;
    returnToHandshake: () => void;
    connected: boolean;
}

export const PlaygroundWebSocketContent: FC<PlaygroundWebSocketContentProps> = ({
    auth,
    websocket,
    formState,
    setFormState,
    types,
    step,
    messages,
    sendMessage,
    startSesssion,
    returnToHandshake,
    connected,
}) => {
    const [scrollAreaHeight, setScrollAreaHeight] = useState(0);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined" || scrollAreaRef.current == null) {
            return;
        }
        const resizeObserver = new window.ResizeObserver(([size]) => {
            if (size != null) {
                setScrollAreaHeight(size.contentRect.height);
            }
        });
        resizeObserver.observe(scrollAreaRef.current);
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className="flex min-h-0 flex-1 shrink items-stretch divide-x">
            <div
                ref={scrollAreaRef}
                className="mask-grad-top w-full overflow-x-hidden overflow-y-scroll overscroll-contain"
            >
                {step === "handshake" ? (
                    <PlaygroundWebSocketHandshakeForm
                        auth={auth}
                        websocket={websocket}
                        formState={formState}
                        setFormState={setFormState}
                        types={types}
                    />
                ) : (
                    <PlaygroundWebSocketSessionForm
                        websocket={websocket}
                        formState={formState}
                        types={types}
                        scrollAreaHeight={scrollAreaHeight}
                        messages={messages}
                        setFormState={setFormState}
                        sendMessage={sendMessage}
                        startSession={startSesssion}
                        returnToHandshake={returnToHandshake}
                        connected={connected}
                    />
                )}
            </div>
        </div>
    );
};
