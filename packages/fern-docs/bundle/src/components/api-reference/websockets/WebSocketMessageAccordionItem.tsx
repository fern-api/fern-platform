"use client";

import { FC } from "react";
import React from "react";

import * as Accordion from "@radix-ui/react-accordion";
import { ArrowDown, ArrowUp, ChevronDown } from "lucide-react";

import { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { cn } from "@fern-docs/components";
import { CopyToClipboardButton } from "@fern-docs/components";
import { FernSyntaxHighlighter } from "@fern-docs/syntax-highlighter";
import { useBooleanState } from "@fern-ui/react-commons/src/useBooleanState";

import { WebSocketMessage } from "./WebSocketMessages";

export interface WebSocketMessageAccordionItemProps {
  message: WebSocketMessage;
  index: number;
  messagesLength: number;
}

export const WebsocketMessageAccordionItem: FC<
  WebSocketMessageAccordionItemProps
> = ({ message, index, messagesLength }) => {
  const animationFrameRef = React.useRef<number | null>(null);
  const isAnimatingState = useBooleanState(false);
  return (
    <Accordion.Item
      value={index.toString()}
      key={index}
      className={cn("group relative")}
    >
      <Accordion.Trigger
        className={cn("fern-web-socket-trigger", {
          "data-[state=open]:bg-(color:--green-a3)":
            message.origin === APIV1Read.WebSocketMessageOrigin.Client,
          "data-[state=open]:bg-(color:--accent-a3)":
            message.origin === APIV1Read.WebSocketMessageOrigin.Server,
          "data-[state=open]:bg-(color:--grayscale-a3)": message.origin == null,
        })}
      >
        {message.origin === APIV1Read.WebSocketMessageOrigin.Client ? (
          <span className="fern-web-socket-client">
            <ArrowUp className="size-icon" />
          </span>
        ) : message.origin === APIV1Read.WebSocketMessageOrigin.Server ? (
          <span className="fern-web-socket-server">
            <ArrowDown className="size-icon" />
          </span>
        ) : null}
        <span className="fern-web-socket-trigger-data">
          {JSON.stringify(message.data)}
        </span>
        {message.displayName != null || message.type != null ? (
          <span className="fern-web-socket-type">
            <span className="fern-web-socket-badge">
              {message.displayName ?? message.type}
            </span>
          </span>
        ) : null}

        <CopyToClipboardButton
          className="fern-web-socket-copy"
          content={() => JSON.stringify(message.data, null, 2)}
          onClick={(e) => e.stopPropagation()}
        />

        <ChevronDown
          className="fern-web-socket-chevron group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </Accordion.Trigger>
      <Accordion.Content
        className={cn("fern-web-socket-content fern-collapsible", {
          "overflow-clip": isAnimatingState.value,
        })}
        onAnimationStart={() => {
          if (animationFrameRef.current != null) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          isAnimatingState.setTrue();
        }}
        onAnimationEnd={() => {
          animationFrameRef.current = requestAnimationFrame(() => {
            isAnimatingState.setFalse();
          });
        }}
      >
        <div className="group/cb-container relative">
          <FernSyntaxHighlighter
            className="w-0 min-w-full overflow-y-auto"
            code={JSON.stringify(message.data, null, 2)}
            language="json"
            fontSize="sm"
          />
        </div>
      </Accordion.Content>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-auto mx-px rounded-[inherit] ring-inset ring-transparent group-focus-within:ring-1",
          {
            "group-focus-within:ring-(--green-a5)":
              message.origin === APIV1Read.WebSocketMessageOrigin.Client,
            "group-focus-within:ring-(color:--accent-a5)":
              message.origin === APIV1Read.WebSocketMessageOrigin.Server,
            "group-focus-within:ring-border-default": message.origin == null,
            "rounded-b-3 mb-px": index === messagesLength,
          }
        )}
      />
    </Accordion.Item>
  );
};
