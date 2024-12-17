import { AlgoliaRecordHit } from "@/types";
import { Badge } from "@fern-ui/components/badges";
import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { Message } from "ai/react";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { ArrowLeft, ArrowUp, Sparkles, SquarePen, StopCircle } from "lucide-react";
import {
    ComponentPropsWithoutRef,
    KeyboardEventHandler,
    ReactElement,
    ReactNode,
    createElement,
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import type { Components } from "react-markdown";
import { useIsomorphicLayoutEffect } from "swr/_internal";
import { FootnoteSup, FootnotesSection } from "../chatbot/footnote";
import { ChatbotTurnContextProvider, useChatbotTurnContext } from "../chatbot/turn-context";
import { combineSearchResults, squeezeMessages } from "../chatbot/utils";
import * as Command from "../cmdk";
import { MarkdownContent } from "../md-content";
import { useFacetFilters } from "../search-client";
import { CommandLink } from "../shared/command-link";
import tunnel from "../tunnel-rat";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { TextArea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { afterInput } from "./desktop-command";
import { DesktopCommandInput } from "./desktop-command-input";
import { DesktopCommandRoot } from "./desktop-command-root";

const headerActions = tunnel();
const composerActions = tunnel();
const composer = tunnel();

export const DesktopCommandWithAskAI = forwardRef<
    HTMLDivElement,
    Omit<ComponentPropsWithoutRef<typeof DesktopCommandRoot>, "children"> & {
        isAskAI?: boolean;
        onClose?: () => void;
        children?: ReactNode | ((props: { isAskAI: boolean }) => ReactNode);
    }
>((props, ref) => {
    const { children: childrenProp, onClose, isAskAI = false, ...rest } = props;
    const { filters, handlePopState: handlePopFilters } = useFacetFilters();

    const children = typeof childrenProp === "function" ? childrenProp({ isAskAI }) : childrenProp;

    return (
        <DesktopCommandRoot
            label={isAskAI ? "Ask AI" : "Search"}
            {...rest}
            ref={ref}
            shouldFilter={!isAskAI}
            onPopState={
                isAskAI
                    ? rest.onPopState
                    : composeEventHandlers(rest.onPopState, handlePopFilters, {
                          checkForDefaultPrevented: false,
                      })
            }
            onEscapeKeyDown={composeEventHandlers(rest.onEscapeKeyDown, () => onClose?.(), {
                checkForDefaultPrevented: false,
            })}
            escapeKeyShouldPopFilters={!isAskAI && filters.length > 0}
        >
            {children}
        </DesktopCommandRoot>
    );
});

DesktopCommandWithAskAI.displayName = "DesktopCommandWithAskAI";

export const DesktopAskAIContent = ({
    onReturnToSearch,
    isThinking,
    children,
}: {
    onReturnToSearch?: () => void;
    isThinking?: boolean;
    children?: ReactNode;
}): ReactElement => {
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
                <div className="flex gap-2">
                    <headerActions.Out />
                    <afterInput.Out />
                </div>
            </div>
            <DesktopAskAIChat isThinking={isThinking}>{children}</DesktopAskAIChat>
        </>
    );
};

// const UserScrolledContext = createContext<[boolean, Dispatch<SetStateAction<boolean>>]>([false, noop]);
const userScrolledAtom = atom(false);

const DesktopAskAIChat = ({ isThinking, children }: { isThinking?: boolean; children?: ReactNode }) => {
    const setUserScrolled = useSetAtom(userScrolledAtom);

    // Reset userScrolled when the chat is loading
    useIsomorphicLayoutEffect(() => {
        if (isThinking) {
            setUserScrolled(false);
        }
    }, [isThinking]);

    const [isScrolled, setIsScrolled] = useState(false);

    return (
        <>
            <Command.List
                onWheel={(e) => {
                    if (e.deltaY > 0) {
                        setUserScrolled(true);
                    }
                }}
                onTouchMove={(e) => {
                    if (e.touches[0]?.clientY !== e.touches[e.touches.length - 1]?.clientY) {
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
                data-disable-animation={isThinking ? "" : undefined}
            >
                {children}
            </Command.List>

            <composer.Out />
        </>
    );
};

export const AskAIComposer = forwardRef<
    HTMLTextAreaElement,
    ComponentPropsWithoutRef<typeof TextArea> & {
        isLoading?: boolean;
        stop?: () => void;
        onSend?: (message: string) => void;
        onPopState?: KeyboardEventHandler<HTMLTextAreaElement>;
    }
>(({ isLoading, stop, onSend, onPopState, ...props }, forwardedRef) => {
    const setUserScrolled = useSetAtom(userScrolledAtom);
    const value = typeof props.value === "string" ? props.value : "";
    const canSubmit = value.trim().split(/\s+/).length >= 2;
    const inputRef = useRef<HTMLTextAreaElement>(null);
    return (
        <composer.In>
            <div
                className="border-t border-[var(--grayscale-a6)] cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                <DesktopCommandInput asChild>
                    <TextArea
                        ref={composeRefs(forwardedRef, inputRef)}
                        autoFocus
                        placeholder="Ask AI a question..."
                        minLines={1}
                        lineHeight={24}
                        maxLines={10}
                        padding={8}
                        {...props}
                        className={cn("w-full resize-none focus:outline-none block p-2", props.className)}
                        style={{ fontSize: "16px", lineHeight: "24px", maxHeight: 200, ...props.style }}
                        onKeyDown={composeEventHandlers(
                            props.onKeyDown,
                            (e) => {
                                if (e.key === "Enter") {
                                    if (!e.shiftKey && value.length === 0) {
                                        return;
                                    } else if (isLoading) {
                                        stop?.();
                                        e.preventDefault();
                                    } else {
                                        if (canSubmit) {
                                            onSend?.(value);
                                        }
                                        e.preventDefault();
                                    }

                                    e.stopPropagation();
                                } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                    if (value.length === 0) {
                                        setUserScrolled(true);
                                        return;
                                    }
                                    e.stopPropagation();
                                } else if (value.length === 0 && e.key === "Backspace" && (e.ctrlKey || e.metaKey)) {
                                    onPopState?.(e);
                                }
                            },
                            { checkForDefaultPrevented: false },
                        )}
                    />
                </DesktopCommandInput>
                <div className="flex items-center justify-between pb-2 px-2">
                    <div>
                        <composerActions.Out />
                    </div>
                    <Button
                        size="icon"
                        className="rounded-full"
                        variant="ghost"
                        onClick={isLoading ? stop : () => onSend?.(value)}
                        disabled={!isLoading && !canSubmit}
                    >
                        {isLoading ? <StopCircle /> : <ArrowUp />}
                    </Button>
                </div>
            </div>
        </composer.In>
    );
});

AskAIComposer.displayName = "AskAIComposer";

interface AskAICommandItemsProps {
    messages: readonly Message[];
    onSelectHit?: (path: string) => void;
    components?: Components;
    isThinking?: boolean;
    children?: ReactNode;
    prefetch?: (path: string) => Promise<void>;
    domain: string;
}

export const AskAICommandItems = memo<AskAICommandItemsProps>((props): ReactElement => {
    const { messages, onSelectHit, components: componentsProp, isThinking, children, prefetch, domain } = props;
    const userScrolled = useAtomValue(userScrolledAtom);
    const squeezedMessages = squeezeMessages(messages);

    const lastConversationRef = useRef<Element | null>(null);
    const lastConversationId =
        squeezedMessages[squeezedMessages.length - 1]?.assistant?.id ??
        squeezedMessages[squeezedMessages.length - 1]?.user?.id;

    // Reset lastConversationRef when the conversation ID changes
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

    // Scroll to the last conversation when the conversation is thinking and the user hasn't scrolled
    useEffect(() => {
        if (lastConversationRef.current && isThinking && !userScrolled) {
            lastConversationRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

    const createAssistantComponents = useCallback(
        (searchResults: AlgoliaRecordHit[]): Components => {
            return {
                ...componentsProp,
                sup: FootnoteSup,
                section: ({ children, node, ...props }) => {
                    if (node?.properties["dataFootnotes"]) {
                        return <FootnotesSection node={node} searchResults={searchResults} className="hidden" />;
                    }

                    if (componentsProp?.section) {
                        return createElement(componentsProp.section, { ...props, node }, children);
                    }

                    return <section {...props}>{children}</section>;
                },
            };
        },
        [componentsProp],
    );

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
                                scrollLogicalPosition="start"
                            >
                                <article>
                                    <div className="relative max-w-[70%] rounded-3xl bg-[var(--grayscale-a3)] px-5 py-2 whitespace-pre-wrap ml-auto w-fit mb-2">
                                        <section className="prose prose-sm dark:prose-invert cursor-auto">
                                            <MarkdownContent components={componentsProp}>
                                                {message.user?.content ?? "_No user message_"}
                                            </MarkdownContent>
                                        </section>
                                    </div>
                                    <div className="flex items-start justify-start gap-4">
                                        <Sparkles className="size-4 shrink-0 my-1" />
                                        <section className="prose prose-sm dark:prose-invert flex-1 shrink cursor-text">
                                            {message.assistant?.content && (
                                                <MarkdownContent components={createAssistantComponents(searchResults)}>
                                                    {message.assistant.content}
                                                </MarkdownContent>
                                            )}
                                            {isThinking &&
                                                (!message.toolInvocations ||
                                                    message.toolInvocations.some(
                                                        (invocation) => invocation.state !== "result",
                                                    ) ||
                                                    !message.assistant?.content) && (
                                                    <p className="text-[var(--grayscale-a10)]">Thinking...</p>
                                                )}
                                            {!isThinking && !message.assistant?.content && (
                                                <p className="text-[var(--grayscale-a10)] italic">No response</p>
                                            )}
                                        </section>
                                    </div>
                                </article>
                            </Command.Item>
                            <FootnoteCommands onSelect={onSelectHit} prefetch={prefetch} domain={domain} />
                        </Command.Group>
                    </ChatbotTurnContextProvider>
                );
            })}
        </>
    );
});

AskAICommandItems.displayName = "AskAICommandItems";

export const NewChatButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof Button>>((props, ref) => {
    return (
        <headerActions.In>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button ref={ref} size="iconXs" variant="outline" {...props}>
                            <SquarePen />
                        </Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent>
                            <p>New chat</p>
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
            </TooltipProvider>
        </headerActions.In>
    );
});

NewChatButton.displayName = "NewChatButton";

function FootnoteCommands({
    onSelect,
    prefetch,
    domain,
}: {
    onSelect?: (path: string) => void;
    prefetch?: (path: string) => Promise<void>;
    domain: string;
}) {
    const { footnotesAtom } = useChatbotTurnContext();
    const footnotes = useAtomValue(footnotesAtom);
    return (
        <>
            {footnotes.map((footnote, idx) => (
                <CommandLink
                    key={footnote.ids.join("-")}
                    href={footnote.url}
                    onSelect={onSelect}
                    prefetch={prefetch}
                    domain={domain}
                >
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

export const DesktopAskAIComposerActions = composerActions.In;
