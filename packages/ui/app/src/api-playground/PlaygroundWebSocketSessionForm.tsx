import { ArrowLeftIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { Dispatch, FC, SetStateAction, useCallback } from "react";
import { WifiOff } from "react-feather";
import { WebSocketMessage, WebSocketMessages } from "../api-page/web-socket/WebSocketMessages";
import { FernButton, FernButtonGroup } from "../components/FernButton";
import { FernCard } from "../components/FernCard";
import { ResolvedTypeDefinition, ResolvedWebSocketChannel, ResolvedWebSocketMessage } from "../util/resolver";
import { titleCase } from "../util/titleCase";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { PlaygroundWebSocketRequestFormState } from "./types";
import { HorizontalSplitPane } from "./VerticalSplitPane";

interface PlaygroundWebSocketSessionFormProps {
    websocket: ResolvedWebSocketChannel;
    formState: PlaygroundWebSocketRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundWebSocketRequestFormState>>;
    // response: Loadable<ResponsePayload>;
    // sendRequest: () => void;
    types: Record<string, ResolvedTypeDefinition>;
    scrollAreaHeight: number;
    messages: WebSocketMessage[];
    sendMessage: (message: ResolvedWebSocketMessage, data: unknown) => void;
    startSession: () => void;
    returnToHandshake: () => void;
    connected: boolean;
}

export const PlaygroundWebSocketSessionForm: FC<PlaygroundWebSocketSessionFormProps> = ({
    websocket,
    formState,
    setFormState,
    types,
    scrollAreaHeight,
    messages,
    sendMessage,
    startSession,
    returnToHandshake,
    connected,
}) => {
    const setMessage = useCallback(
        (message: ResolvedWebSocketMessage, data: unknown) => {
            setFormState((old) => ({
                ...old,
                messages: {
                    ...old.messages,
                    [message.type]: typeof data === "function" ? data(old.messages[message.type]) : data,
                },
            }));
        },
        [setFormState],
    );

    return (
        <HorizontalSplitPane
            rizeBarHeight={scrollAreaHeight}
            leftClassName="pl-6 pr-1 mt relative"
            rightClassName="pl-1"
        >
            <div className="mx-auto w-full max-w-5xl space-y-6 pt-6">
                <div
                    className={classNames("col-span-2 space-y-8 pb-20", {
                        "opacity-50 pointer-events-none": !connected,
                    })}
                >
                    {websocket.messages
                        .filter((message) => message.origin === "client")
                        .map((message) => (
                            <div key={message.type}>
                                <div className="mb-4 px-4">
                                    <h5 className="t-muted m-0">{message.displayName ?? titleCase(message.type)}</h5>
                                </div>
                                <FernCard className="divide-border-default divide-y rounded-xl shadow-sm">
                                    <div className="p-4">
                                        <PlaygroundTypeReferenceForm
                                            id="header"
                                            shape={message.body}
                                            onChange={(data) => setMessage(message, data)}
                                            value={formState?.messages[message.type]}
                                            types={types}
                                            disabled={!connected}
                                        />
                                    </div>

                                    <div className="flex justify-end p-4">
                                        <FernButton
                                            text="Send message"
                                            rightIcon="send"
                                            intent="primary"
                                            onClick={() => {
                                                sendMessage(message, formState?.messages[message.type]);
                                            }}
                                            disabled={!connected}
                                        />
                                    </div>
                                </FernCard>
                            </div>
                        ))}
                </div>

                {!connected && (
                    <div className="absolute inset-0">
                        {
                            <div className="flex h-full w-full items-center justify-center">
                                <div className="flex flex-col items-center space-y-4">
                                    <WifiOff className="t-muted" size={28} />
                                    <h4 className="m-0">Websocket session is closed.</h4>
                                    <FernButtonGroup>
                                        <FernButton
                                            text="Return to handshake"
                                            icon={<ArrowLeftIcon />}
                                            intent="primary"
                                            variant="outlined"
                                            onClick={returnToHandshake}
                                        />
                                        <FernButton text="Restart session" intent="primary" onClick={startSession} />
                                    </FernButtonGroup>
                                </div>
                            </div>
                        }
                    </div>
                )}
            </div>

            <div className="sticky inset-0 flex py-6 pr-6" style={{ height: scrollAreaHeight }}>
                <FernCard className="flex min-w-0 flex-1 shrink flex-col overflow-hidden rounded-xl shadow-sm">
                    <div className="border-default flex h-10 w-full shrink-0 items-center justify-between border-b px-3 py-2">
                        <span className="t-muted text-xs uppercase">Messages</span>
                    </div>
                    <WebSocketMessages messages={messages} />
                </FernCard>
            </div>
        </HorizontalSplitPane>
    );
};
