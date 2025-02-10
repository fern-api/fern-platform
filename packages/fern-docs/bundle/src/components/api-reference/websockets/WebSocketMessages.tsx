"use client";

import { FC } from "react";
import { Virtuoso } from "react-virtuoso";

import * as Accordion from "@radix-ui/react-accordion";

import { APIV1Read } from "@fern-api/fdr-sdk/client/types";

import { WebsocketMessageAccordionItem } from "./WebSocketMessageAccordionItem";

export interface WebSocketMessage {
  type: string | undefined;
  origin: APIV1Read.WebSocketMessageOrigin | "endSample" | undefined;
  displayName: string | undefined;
  data: unknown | undefined;
  // shape: APIV1Read.WebSocketMessageBodyShape;
}

export interface WebSocketMessagesProps {
  messages: WebSocketMessage[];
  virtualized?: boolean;
  // types: Record<string, ResolvedTypeDefinition>;
}

export const WebSocketMessages: FC<WebSocketMessagesProps> = ({
  messages,
  virtualized,
}) => {
  return (
    <Accordion.Root
      type="multiple"
      className="divide-default relative z-0 table size-full table-fixed divide-y"
    >
      {messages.length === 0 && (
        <div className="absolute inset-0 flex size-full items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            {/* <WifiOff className="t-muted" size={28} /> */}
            <h4 className="m-0">No messages...</h4>
          </div>
        </div>
      )}

      {virtualized ? (
        <Virtuoso
          data={messages}
          itemContent={(index, message) => (
            <WebsocketMessageAccordionItem
              key={index}
              message={message}
              index={index}
              messagesLength={messages.length - 1}
            />
          )}
          followOutput={"smooth"}
        />
      ) : (
        messages.map((message, index) => (
          <WebsocketMessageAccordionItem
            key={index}
            message={message}
            index={index}
            messagesLength={messages.length - 1}
          />
        ))
      )}
    </Accordion.Root>
  );
};
