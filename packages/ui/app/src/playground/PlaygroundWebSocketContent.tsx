import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";
import { WebSocketMessage } from "../api-reference/web-socket/WebSocketMessages";
import { PlaygroundWebSocketSessionForm } from "./PlaygroundWebSocketSessionForm";
import { PlaygroundWebSocketRequestFormState } from "./types";
import { WebSocketContext } from "./types/endpoint-context";

interface PlaygroundWebSocketContentProps {
    context: WebSocketContext;
    formState: PlaygroundWebSocketRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundWebSocketRequestFormState>>;
    messages: WebSocketMessage[];
    startSesssion: () => void;
    clearMessages: () => void;
    sendMessage: (message: ApiDefinition.WebSocketMessage, data: unknown) => void;
    connected: boolean;
    error: string | null;
}

export const PlaygroundWebSocketContent: FC<PlaygroundWebSocketContentProps> = ({
    context,
    formState,
    setFormState,
    messages,
    sendMessage,
    startSesssion,
    clearMessages,
    connected,
    error,
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
        <div className="flex min-h-0 w-full flex-1 shrink items-stretch divide-x">
            <div
                ref={scrollAreaRef}
                className="mask-grad-top-6 w-full overflow-x-hidden overflow-y-scroll overscroll-contain"
            >
                <PlaygroundWebSocketSessionForm
                    context={context}
                    formState={formState}
                    scrollAreaHeight={scrollAreaHeight}
                    messages={messages}
                    setFormState={setFormState}
                    sendMessage={sendMessage}
                    startSession={startSesssion}
                    clearMessages={clearMessages}
                    connected={connected}
                    error={error}
                />
            </div>
        </div>
    );
};
