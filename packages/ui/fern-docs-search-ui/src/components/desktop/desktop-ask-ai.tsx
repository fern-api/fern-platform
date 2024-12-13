import { Badge } from "@fern-ui/components/badges";
import { useDebouncedCallback } from "@fern-ui/react-commons";
import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Message, useChat } from "ai/react";
import { useAtomValue } from "jotai";
import { ArrowLeft, ArrowUp, Sparkles, StopCircle } from "lucide-react";
import {
    ComponentPropsWithoutRef,
    ReactElement,
    ReactNode,
    createElement,
    forwardRef,
    isValidElement,
    memo,
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Components } from "react-markdown";
import { useIsomorphicLayoutEffect } from "swr/_internal";
import { FootnoteSup, FootnotesSection } from "../chatbot/footnote";
import { ChatbotTurnContextProvider, useChatbotTurnContext } from "../chatbot/turn-context";
import { combineSearchResults, squeezeMessages } from "../chatbot/utils";
import * as Command from "../cmdk";
import { CodeBlock } from "../code-block";
import { MarkdownContent } from "../md-content";
import { useFacetFilters } from "../search-client";
import { CommandLink } from "../shared/command-link";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { TextArea } from "../ui/textarea";
import { DesktopCommandContent, afterInput } from "./desktop-command";
import { DesktopCommandInput } from "./desktop-command-input";
import { DesktopCommandRoot } from "./desktop-command-root";
import { Suggestions } from "./suggestions";

export const DesktopCommandWithAskAI = forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<typeof DesktopCommandRoot> & {
        askAI?: boolean;
        defaultAskAI?: boolean;
        setAskAI?: (askAI: boolean) => void;
        onClose?: () => void;
        api?: string;
        suggestionsApi?: string;
        body?: object;
        headers?: Record<string, string>;
        initialInput?: string;
        chatId?: string;
        onSelectHit?: (path: string) => void;
        prefetch?: (path: string) => Promise<void>;
    }
>(
    (
        {
            children,
            api,
            suggestionsApi,
            body,
            headers,
            onClose,
            askAI: askAIProp,
            setAskAI: setAskAIProp,
            defaultAskAI,
            initialInput,
            chatId,
            onSelectHit,
            prefetch,
            ...props
        },
        ref,
    ) => {
        const [askAI, setAskAI] = useControllableState<boolean>({
            defaultProp: defaultAskAI,
            prop: askAIProp,
            onChange: setAskAIProp,
        });
        const { filters, handlePopState: handlePopFilters } = useFacetFilters();

        return (
            <DesktopCommandRoot
                label={askAI ? "Ask AI" : "Search"}
                {...props}
                ref={ref}
                shouldFilter={!askAI}
                onPopState={
                    askAI
                        ? props.onPopState
                        : composeEventHandlers(props.onPopState, handlePopFilters, {
                              checkForDefaultPrevented: false,
                          })
                }
                onEscape={composeEventHandlers(props.onEscape, () => onClose?.(), { checkForDefaultPrevented: false })}
                escapeKeyShouldPopFilters={!askAI && filters.length > 0}
            >
                {askAI ? (
                    <DesktopAskAIContent
                        api={api}
                        suggestionsApi={suggestionsApi}
                        body={body}
                        headers={headers}
                        onReturnToSearch={() => setAskAI(false)}
                        initialInput={initialInput}
                        chatId={chatId}
                        onSelectHit={onSelectHit}
                        prefetch={prefetch}
                    />
                ) : (
                    <DesktopCommandContent>{children}</DesktopCommandContent>
                )}
            </DesktopCommandRoot>
        );
    },
);

DesktopCommandWithAskAI.displayName = "DesktopCommandWithAskAI";

const DesktopAskAIContent = ({
    onReturnToSearch,
    initialInput,
    chatId,
    api,
    suggestionsApi,
    body,
    headers,
    onSelectHit,
    prefetch,
}: {
    onReturnToSearch?: () => void;
    initialInput?: string;
    chatId?: string;
    api?: string;
    suggestionsApi?: string;
    body?: object;
    headers?: Record<string, string>;
    onSelectHit?: (path: string) => void;
    prefetch?: (path: string) => Promise<void>;
}) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [userScrolled, setUserScrolled] = useState(false);

    const focus = useCallback(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        });
    }, [inputRef]);

    const chat = useChat({
        id: chatId,
        initialInput,
        api,
        body,
        headers,
    });

    // Reset userScrolled when the chat is loading
    useIsomorphicLayoutEffect(() => {
        if (chat.isLoading) {
            setUserScrolled(false);
        }
    }, [chat.isLoading]);

    const askAI = useDebouncedCallback(
        (message: string) => {
            if (chat.isLoading) {
                return;
            }

            if (message.trim().split(/\s+/).length < 2) {
                focus();
                return;
            }
            void chat.append({ role: "user", content: message });
            chat.setInput("");
            focus();
        },
        [chat, focus],
        1000,
        { edges: ["leading"] },
    );

    const [isScrolled, setIsScrolled] = useState(false);

    const messages = useDeferredValue(chat.messages);

    return (
        <>
            <div className="flex items-center justify-between p-2 pb-0">
                <div>
                    {onReturnToSearch && (
                        <Button size="xs" variant="outline" onClick={onReturnToSearch}>
                            <ArrowLeft />
                            Back to search
                        </Button>
                    )}
                </div>
                <div>
                    <afterInput.Out />
                </div>
            </div>
            <Command.List
                onWheel={(e) => {
                    if (e.deltaY > 0) {
                        setUserScrolled(true);
                    }
                }}
                onTouchMove={(e) => {
                    if (e.touches[0].clientY !== e.touches[e.touches.length - 1].clientY) {
                        setUserScrolled(true);
                    }
                }}
                onScroll={(e) => {
                    if (e.currentTarget.scrollTop > 5) {
                        setIsScrolled(true);
                    } else {
                        setIsScrolled(false);
                    }
                }}
                tabIndex={-1}
                className={cn(isScrolled && "mask-grad-top-3")}
                data-disable-animation={chat.isLoading ? "" : undefined}
            >
                <AskAICommandItems
                    messages={messages}
                    onSelectHit={onSelectHit}
                    prefetch={prefetch}
                    components={useMemo(
                        () => ({
                            pre(props) {
                                if (isValidElement(props.children) && props.children.type === "code") {
                                    const { children, className } = props.children.props as {
                                        children: string;
                                        className: string;
                                    };
                                    if (typeof children === "string") {
                                        const match = /language-(\w+)/.exec(className || "")?.[1] ?? "plaintext";
                                        return <CodeBlock code={children} language={match} fontSize="sm" />;
                                    }
                                }
                                return <pre {...props} />;
                            },

                            a: ({ children, node, ...props }) => (
                                <a
                                    {...props}
                                    className="hover:text-[var(--accent-a10)] font-semibold decoration-[var(--accent-a10)] hover:decoration-2"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {children}
                                </a>
                            ),
                        }),
                        [],
                    )}
                    isLoading={chat.isLoading}
                    userScrolled={userScrolled}
                >
                    {suggestionsApi && <Suggestions api={suggestionsApi} body={body} headers={headers} askAI={askAI} />}
                </AskAICommandItems>
            </Command.List>

            <AskAIComposer
                chat={chat}
                onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        setUserScrolled(true);
                    }
                }}
            />
        </>
    );
};

const AskAIComposer = forwardRef<
    HTMLTextAreaElement,
    ComponentPropsWithoutRef<"textarea"> & { chat: ReturnType<typeof useChat> }
>(({ chat, ...props }, forwardedRef) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    return (
        <div className="border-t border-[var(--grayscale-a6)] cursor-text" onClick={() => inputRef.current?.focus()}>
            <DesktopCommandInput asChild>
                <TextArea
                    ref={composeRefs(forwardedRef, inputRef)}
                    autoFocus
                    placeholder="Ask AI"
                    {...props}
                    className={cn("w-full resize-none focus:outline-none block p-2", props.className)}
                    style={{ fontSize: "16px", lineHeight: "24px", maxHeight: 200, ...props.style }}
                    minLines={1}
                    lineHeight={24}
                    maxLines={10}
                    padding={8}
                    onKeyDownCapture={composeEventHandlers(
                        props.onKeyDownCapture,
                        (e) => {
                            if (e.key === "Enter") {
                                if (!e.shiftKey && chat.input.length === 0) {
                                    return;
                                } else if (chat.isLoading) {
                                    chat.stop();
                                    e.preventDefault();
                                } else {
                                    chat.handleSubmit();
                                    e.preventDefault();
                                }

                                e.stopPropagation();
                            } else if (chat.input.length > 0 && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
                                e.stopPropagation();
                            }
                        },
                        { checkForDefaultPrevented: false },
                    )}
                    value={chat.input}
                    onValueChange={chat.setInput}
                />
            </DesktopCommandInput>
            <div className="ml-auto w-fit pb-2 pr-2">
                <Button
                    size="icon"
                    className="rounded-full"
                    variant="ghost"
                    onClick={chat.isLoading ? chat.stop : chat.handleSubmit}
                    disabled={!chat.isLoading && chat.input.trim().split(/\s+/).length < 2}
                >
                    {chat.isLoading ? <StopCircle /> : <ArrowUp />}
                </Button>
            </div>
        </div>
    );
});

AskAIComposer.displayName = "AskAIComposer";

const AskAICommandItems = memo<{
    messages: Message[];
    onSelectHit?: (path: string) => void;
    components?: Components;
    isLoading?: boolean;
    userScrolled?: boolean;
    children?: ReactNode;
    prefetch?: (path: string) => Promise<void>;
}>(({ messages, onSelectHit, components, userScrolled = true, isLoading, children, prefetch }): ReactElement => {
    const squeezedMessages = squeezeMessages(messages);

    const lastConversationRef = useRef<Element | null>(null);
    const lastConversationId =
        squeezedMessages[squeezedMessages.length - 1]?.assistant?.id ??
        squeezedMessages[squeezedMessages.length - 1]?.user?.id;
    useIsomorphicLayoutEffect(() => {
        if (
            lastConversationRef.current &&
            lastConversationRef.current.getAttribute("data-conversation-id") !== lastConversationId
        ) {
            lastConversationRef.current = null;
        }

        if (!lastConversationRef.current) {
            lastConversationRef.current = document.querySelector(`[data-conversation-id="${lastConversationId}"]`);
        }
    }, [lastConversationId]);

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
                            <Command.Item
                                data-conversation-id={message.assistant?.id ?? message.user?.id}
                                value={message.assistant?.id ?? message.user?.id}
                                onSelect={() => {
                                    const content = message.assistant?.content;
                                    if (content) {
                                        void navigator.clipboard.writeText(content);
                                    }
                                }}
                                asChild
                            >
                                <article>
                                    <div className="relative max-w-[70%] rounded-3xl bg-[var(--grayscale-a3)] px-5 py-2 whitespace-pre-wrap ml-auto w-fit mb-2">
                                        <section className="prose prose-sm dark:prose-invert">
                                            <MarkdownContent components={components}>
                                                {message.user?.content ?? "_No user message_"}
                                            </MarkdownContent>
                                        </section>
                                    </div>
                                    <div className="flex items-start justify-start gap-4">
                                        <Sparkles className="size-4 shrink-0 my-1" />
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
                                    </div>
                                </article>
                            </Command.Item>
                            <FootnoteCommands onSelect={onSelectHit} prefetch={prefetch} />
                        </Command.Group>
                    </ChatbotTurnContextProvider>
                );
            })}
        </>
    );
});

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
