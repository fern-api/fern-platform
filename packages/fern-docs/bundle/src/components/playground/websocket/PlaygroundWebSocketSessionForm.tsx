"use client";

import { Dispatch, FC, SetStateAction, useCallback } from "react";

import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type { WebSocketContext } from "@fern-api/fdr-sdk/api-definition";
import titleCase from "@fern-api/ui-core-utils/titleCase";
import { cn } from "@fern-docs/components";
import { FernButton, FernCard, FernScrollArea } from "@fern-docs/components";

import { WebSocketMessagesVirtualized } from "@/components/api-reference/websockets/WebSocketMessagesVirtualized";

import { HorizontalSplitPane } from "../VerticalSplitPane";
import { PlaygroundTypeReferenceForm } from "../form/PlaygroundTypeReferenceForm";
import { useWebsocketMessages } from "../hooks/useWebsocketMessages";
import { PlaygroundWebSocketRequestFormState } from "../types";
import { PlaygroundWebSocketHandshakeForm } from "./PlaygroundWebSocketHandshakeForm";

interface PlaygroundWebSocketSessionFormProps {
  context: WebSocketContext;
  formState: PlaygroundWebSocketRequestFormState;
  setFormState: Dispatch<SetStateAction<PlaygroundWebSocketRequestFormState>>;
  scrollAreaHeight: number;
  sendMessage: (message: ApiDefinition.WebSocketMessage, data: unknown) => void;
  clearMessages: () => void;
  startSession: () => void;
  connected: boolean;
  error: string | null;
  authForm: React.ReactNode;
}

export const PlaygroundWebSocketSessionForm: FC<
  PlaygroundWebSocketSessionFormProps
> = ({
  context,
  formState,
  setFormState,
  scrollAreaHeight,
  sendMessage,
  clearMessages,
  connected,
  error,
  authForm,
}) => {
  const { messages } = useWebsocketMessages(context.node.id);

  const setMessage = useCallback(
    (message: ApiDefinition.WebSocketMessage, data: unknown) => {
      setFormState((old) => ({
        ...old,
        messages: {
          ...old.messages,
          [message.type]:
            typeof data === "function"
              ? data(old.messages[message.type])
              : data,
        },
      }));
    },
    [setFormState]
  );

  return (
    <HorizontalSplitPane
      rizeBarHeight={scrollAreaHeight}
      leftClassName="pl-6 pr-1 mt relative"
      rightClassName="pl-1"
    >
      <div className="mx-auto w-full max-w-5xl space-y-6 py-6">
        <div className="space-y-8">
          <PlaygroundWebSocketHandshakeForm
            context={context}
            formState={formState}
            setFormState={setFormState}
            error={error}
            disabled={connected}
            authForm={authForm}
          />

          {context.channel.messages
            .filter((message) => message.origin === "client")
            .map((message) => (
              <div key={message.type}>
                <div className="mb-4 px-4">
                  <h5 className="text-(color:--grayscale-a11) m-0">
                    {message.displayName ?? titleCase(message.type)}
                  </h5>
                </div>
                <FernCard className="divide-border-default rounded-3 divide-y">
                  <div className="p-4">
                    <PlaygroundTypeReferenceForm
                      id={message.type}
                      shape={message.body}
                      onChange={(data) => setMessage(message, data)}
                      value={formState?.messages[message.type]}
                      types={context.types}
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
                    />
                  </div>
                </FernCard>
              </div>
            ))}
        </div>
      </div>

      <div
        className="sticky inset-0 flex py-6 pr-6"
        style={{ height: scrollAreaHeight }}
      >
        <FernCard className="rounded-3 flex min-w-0 flex-1 shrink flex-col overflow-hidden">
          <div className="border-border-default flex h-10 w-full shrink-0 items-center justify-between border-b px-3 py-2">
            <span className="text-(color:--grayscale-a11) text-xs uppercase">
              Messages
            </span>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <FernButton
                  text="Clear"
                  variant="minimal"
                  size="small"
                  onClick={clearMessages}
                />
              )}

              <span
                className={cn(
                  "rounded-2 -mr-1 inline-flex items-center gap-2 px-2 py-0.5",
                  {
                    "text-(color:--accent-a11) bg-(color:--accent-a3)":
                      connected,
                    "bg-(color:--red-a3) text-(color:--red-a11)": !connected,
                  }
                )}
              >
                <span className="relative inline-flex size-2">
                  {connected && (
                    <span className="bg-(color:--accent) absolute inline-flex size-full animate-ping rounded-full opacity-75" />
                  )}
                  <span
                    className={cn("relative inline-flex size-2 rounded-full", {
                      "bg-(color:--accent)": connected,
                      "bg-(color:--red-a5)": !connected,
                    })}
                  ></span>
                </span>
                <span className="font-mono text-sm">
                  {connected ? "Connected" : "Not connected"}
                </span>
              </span>
            </div>
          </div>
          <FernScrollArea rootClassName="flex-1 rounded-b-[inherit]">
            <WebSocketMessagesVirtualized messages={messages} />
          </FernScrollArea>
        </FernCard>
      </div>
    </HorizontalSplitPane>
  );
};
