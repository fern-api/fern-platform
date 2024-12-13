import { Badge } from "@fern-ui/components/badges";
import { Message } from "ai";
import { Command } from "cmdk";
import { useAtomValue } from "jotai";
import { Sparkles } from "lucide-react";
import { ReactElement, ReactNode, createElement, memo, useEffect, useRef } from "react";
import type { Components } from "react-markdown";
import { useIsomorphicLayoutEffect } from "swr/_internal";
import { FootnoteSup, FootnotesSection } from "../chatbot/footnote";
import { ChatbotTurnContextProvider, useChatbotTurnContext } from "../chatbot/turn-context";
import { combineSearchResults, squeezeMessages } from "../chatbot/utils";
import { MarkdownContent } from "../md-content";
import { CommandLink } from "../shared/command-link";

interface AskAICommandItemsProps {
    messages: Message[];
    onSelectHit?: (path: string) => void;
    components?: Components;
    isLoading?: boolean;
    userScrolled?: boolean;
    children?: ReactNode;
    prefetch?: (path: string) => Promise<void>;
}

export const AskAICommandItems = memo(
    ({
        messages,
        onSelectHit,
        components,
        userScrolled = true,
        isLoading,
        children,
        prefetch,
    }: AskAICommandItemsProps): ReactElement => {
        const squeezedMessages = squeezeMessages(messages);

        const lastConversationRef = useRef<Element | null>(null);
        const lastUserConversationId = squeezedMessages[squeezedMessages.length - 1]?.user?.id;
        useIsomorphicLayoutEffect(() => {
            if (
                lastConversationRef.current &&
                lastConversationRef.current.getAttribute("data-conversation-id") !== lastUserConversationId
            ) {
                lastConversationRef.current = null;
            }

            if (!lastConversationRef.current) {
                lastConversationRef.current = document.querySelector(
                    `[data-conversation-id="${lastUserConversationId}"]`,
                );
            }
        }, [lastUserConversationId]);

        useEffect(() => {
            if (lastConversationRef.current && isLoading && !userScrolled) {
                lastConversationRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });

        if (squeezedMessages.length === 0) {
            return (
                <>
                    <div className="flex gap-4 p-2">
                        <Sparkles className="size-4 shrink-0 my-1" />
                        <div className="space-y-2">
                            <p>Hi, I&apos;m an AI assistant with access to documentation and other content.</p>
                        </div>
                    </div>
                    {children}
                </>
            );
        }

        return (
            <>
                {squeezedMessages.map((message, idx) => {
                    const searchResults = combineSearchResults([message]);
                    return (
                        <ChatbotTurnContextProvider key={message.user?.id ?? message.assistant?.id ?? idx}>
                            <Command.Group>
                                <article>
                                    <div
                                        className="relative max-w-[70%] rounded-3xl bg-[var(--grayscale-a3)] px-5 py-2 whitespace-pre-wrap ml-auto w-fit mb-2"
                                        data-conversation-id={message.user?.id}
                                    >
                                        <section className="prose prose-sm dark:prose-invert">
                                            <MarkdownContent components={components}>
                                                {message.user?.content ?? "_No user message_"}
                                            </MarkdownContent>
                                        </section>
                                    </div>
                                    <Command.Item
                                        data-conversation-id={message.assistant?.id}
                                        value={message.assistant?.id ?? message.user?.id}
                                        onSelect={() => {
                                            const content = message.assistant?.content;
                                            if (content) {
                                                void navigator.clipboard.writeText(content);
                                            }
                                        }}
                                    >
                                        <Sparkles className="size-4 shrink-0 my-1 self-start" />
                                        <section className="prose prose-sm dark:prose-invert">
                                            {message.assistant?.content && (
                                                <MarkdownContent
                                                    components={{
                                                        ...components,
                                                        sup: FootnoteSup,
                                                        section: ({ children, node, ...props }) => {
                                                            if (node?.properties["dataFootnotes"]) {
                                                                return (
                                                                    <FootnotesSection
                                                                        node={node}
                                                                        searchResults={searchResults}
                                                                        className="hidden"
                                                                    />
                                                                );
                                                            }

                                                            if (components?.section) {
                                                                return createElement(
                                                                    components.section,
                                                                    { ...props, node },
                                                                    children,
                                                                );
                                                            }

                                                            return <section {...props}>{children}</section>;
                                                        },
                                                    }}
                                                >
                                                    {message.assistant.content}
                                                </MarkdownContent>
                                            )}
                                            {isLoading &&
                                                (!message.toolInvocations ||
                                                    message.toolInvocations.some(
                                                        (invocation) => invocation.state !== "result",
                                                    )) && <p className="text-[var(--grayscale-a10)]">Thinking...</p>}
                                        </section>
                                    </Command.Item>
                                </article>
                                <FootnoteCommands onSelect={onSelectHit} prefetch={prefetch} />
                            </Command.Group>
                        </ChatbotTurnContextProvider>
                    );
                })}
            </>
        );
    },
);

AskAICommandItems.displayName = "AskAICommandItems";

function FootnoteCommands({
    onSelect,
    prefetch,
}: {
    onSelect?: (path: string) => void;
    prefetch?: (path: string) => Promise<void>;
}) {
    const { footnotesAtom } = useChatbotTurnContext();
    const footnotes = useAtomValue(footnotesAtom);
    return (
        <>
            {footnotes.map((footnote, idx) => (
                <CommandLink key={footnote.ids.join("-")} href={footnote.url} onSelect={onSelect} prefetch={prefetch}>
                    <Badge rounded>{String(idx + 1)}</Badge>
                    <div>
                        <div className="text-sm font-semibold">{footnote.title}</div>
                        <div className="text-xs text-[var(--grayscale-a9)]">{footnote.url}</div>
                    </div>
                </CommandLink>
            ))}
        </>
    );
}
