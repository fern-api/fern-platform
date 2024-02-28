import { APIV1Read } from "@fern-api/fdr-sdk";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { FC } from "react";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";
import { FernSyntaxHighlighter } from "../../commons/FernSyntaxHighlighter";

export interface WebSocketMessage {
    type: string;
    origin: APIV1Read.WebSocketMessageOrigin | undefined;
    displayName: string | undefined;
    body: unknown | undefined;
    // shape: APIV1Read.WebSocketMessageBodyShape;
}

interface WebSocketMessagesProps {
    messages: WebSocketMessage[];
    // types: Record<string, ResolvedTypeDefinition>;
}

export const WebSocketMessages: FC<WebSocketMessagesProps> = ({ messages }) => {
    return (
        <Accordion.Root
            type="multiple"
            className="divide-border-default fix relative table w-full table-fixed divide-y"
        >
            {messages.map((message, index) => {
                return (
                    <Accordion.Item
                        value={index.toString()}
                        key={index}
                        className={classNames("group relative last:rounded-b-xl px-px last:pb-px")}
                    >
                        <div
                            className={classNames(
                                "group-focus-within:ring-1 ring-transparent ring-inset absolute inset-0 pointer-events-none z-20 rounded-[inherit]",
                                {
                                    "group-focus-within:ring-border-success":
                                        message.origin === APIV1Read.WebSocketMessageOrigin.Client,
                                    "group-focus-within:ring-border-primary":
                                        message.origin === APIV1Read.WebSocketMessageOrigin.Server,
                                    "group-focus-within:ring-border-default": message.origin == null,
                                },
                            )}
                        />
                        <Accordion.Trigger
                            className={classNames(
                                "w-full flex items-center gap-2 px-3 py-2 hover:data-[state=closed]:bg-tag-default cursor-default transition-background group-data-[state=closed]:rounded-[inherit] transition-[border-radius] duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)]",
                                "sticky top-0 z-10 backdrop-blur",
                                {
                                    "data-[state=open]:bg-tag-success":
                                        message.origin === APIV1Read.WebSocketMessageOrigin.Client,
                                    "data-[state=open]:bg-tag-primary":
                                        message.origin === APIV1Read.WebSocketMessageOrigin.Server,
                                    "data-[state=open]:bg-tag-default": message.origin == null,
                                },
                            )}
                        >
                            {message.origin === APIV1Read.WebSocketMessageOrigin.Client ? (
                                <span className="bg-tag-success t-success inline-block shrink-0 rounded-full p-0.5">
                                    <ArrowUpIcon />
                                </span>
                            ) : message.origin === APIV1Read.WebSocketMessageOrigin.Server ? (
                                <span className="bg-tag-primary t-accent-aaa inline-block shrink-0 rounded-full p-0.5">
                                    <ArrowDownIcon />
                                </span>
                            ) : null}
                            <span className="min-w-0 shrink truncate font-mono text-xs">
                                {JSON.stringify(message.body)}
                            </span>
                            <span
                                className={classNames("flex-1 inline-flex justify-end", {
                                    // "justify-start": event.action === "send",
                                    // "justify-end": event.action === "recieve",
                                })}
                            >
                                <span className="bg-tag-default t-muted h-5 rounded-md px-1.5 py-1 text-xs leading-none">
                                    {message.displayName ?? message.type}
                                </span>
                            </span>

                            <ChevronDownIcon
                                className="t-muted shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                                aria-hidden
                            />
                        </Accordion.Trigger>
                        <Accordion.Content className="data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up overflow-hidden">
                            <div className="group/cb-container relative">
                                <FernSyntaxHighlighter
                                    className="w-0 min-w-full overflow-y-auto"
                                    code={JSON.stringify(message.body, null, 2)}
                                    language="json"
                                    fontSize="sm"
                                />
                                <CopyToClipboardButton
                                    className={
                                        "absolute right-1 top-1 opacity-0 transition group-hover/cb-container:opacity-100"
                                    }
                                    content={() => JSON.stringify(message.body, null, 2)}
                                />
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                );
            })}
        </Accordion.Root>
    );
};
