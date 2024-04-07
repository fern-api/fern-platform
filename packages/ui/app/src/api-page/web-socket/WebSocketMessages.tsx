import { APIV1Read } from "@fern-api/fdr-sdk";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { FC } from "react";
import { CopyToClipboardButton } from "../../syntax-highlighting/CopyToClipboardButton";
import { FernSyntaxHighlighter } from "../../syntax-highlighting/FernSyntaxHighlighter";

export interface WebSocketMessage {
    type: string;
    origin: APIV1Read.WebSocketMessageOrigin | undefined;
    displayName: string | undefined;
    data: unknown | undefined;
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
            className="divide-default relative z-0 table h-full w-full table-fixed divide-y"
        >
            {messages.length === 0 && (
                <div className="absolute inset-0 flex h-full w-full items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                        {/* <WifiOff className="t-muted" size={28} /> */}
                        <h4 className="m-0">No messages...</h4>
                    </div>
                </div>
            )}
            {messages.map((message, index) => {
                return (
                    <Accordion.Item value={index.toString()} key={index} className={cn("group relative")}>
                        <Accordion.Trigger
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 hover:data-[state=closed]:bg-tag-default cursor-default transition-background group-data-[state=closed]:rounded-[inherit] transition-[border-radius] duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)]",
                                "sticky top-0 z-auto backdrop-blur",
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
                                <span className="t-success inline-block shrink-0 rounded-full bg-tag-success p-0.5">
                                    <ArrowUpIcon />
                                </span>
                            ) : message.origin === APIV1Read.WebSocketMessageOrigin.Server ? (
                                <span className="t-accent-aaa inline-block shrink-0 rounded-full bg-tag-primary p-0.5">
                                    <ArrowDownIcon />
                                </span>
                            ) : null}
                            <span className="min-w-0 shrink truncate font-mono text-xs">
                                {JSON.stringify(message.data)}
                            </span>
                            <span
                                className={cn("flex-1 inline-flex justify-end", {
                                    // "justify-start": event.action === "send",
                                    // "justify-end": event.action === "recieve",
                                })}
                            >
                                <span className="t-muted h-5 rounded-md bg-tag-default px-1.5 py-1 text-xs leading-none">
                                    {message.displayName ?? message.type}
                                </span>
                            </span>

                            <CopyToClipboardButton
                                className="-my-2 -ml-1 -mr-2"
                                content={() => JSON.stringify(message.data, null, 2)}
                                onClick={(e) => e.stopPropagation()}
                            />

                            <ChevronDownIcon
                                className="t-muted shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                                aria-hidden
                            />
                        </Accordion.Trigger>
                        <Accordion.Content className="overflow-hidden data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down">
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
                                "mx-px group-focus-within:ring-1 ring-transparent ring-inset absolute inset-0 pointer-events-none z-auto rounded-[inherit]",
                                {
                                    "group-focus-within:ring-border-success":
                                        message.origin === APIV1Read.WebSocketMessageOrigin.Client,
                                    "group-focus-within:ring-border-primary":
                                        message.origin === APIV1Read.WebSocketMessageOrigin.Server,
                                    "group-focus-within:ring-default": message.origin == null,
                                    "mb-px rounded-b-xl": index === messages.length - 1,
                                },
                            )}
                        />
                    </Accordion.Item>
                );
            })}
        </Accordion.Root>
    );
};
