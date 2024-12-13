import { useDebouncedCallback } from "@fern-ui/react-commons";
import { composeEventHandlers } from "@radix-ui/primitive";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { useChat } from "ai/react";
import { Command } from "cmdk";
import { ArrowLeft, ArrowUp, StopCircle } from "lucide-react";
import {
    ComponentPropsWithoutRef,
    forwardRef,
    isValidElement,
    useCallback,
    useDeferredValue,
    useMemo,
    useRef,
    useState,
} from "react";
import { useIsomorphicLayoutEffect } from "swr/_internal";
import { CodeBlock } from "../code-block";
import { useFacetFilters } from "../search-client";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { TextArea } from "../ui/textarea";
import { AskAICommandItems } from "./desktop-ask-ai-conversation";
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

            <div
                className="border-t border-[var(--grayscale-a6)] cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                <DesktopCommandInput asChild>
                    <TextArea
                        ref={inputRef}
                        className="w-full resize-none focus:outline-none block p-2"
                        style={{ fontSize: "16px", lineHeight: "24px", maxHeight: 200 }}
                        minLines={1}
                        lineHeight={24}
                        maxLines={10}
                        padding={8}
                        autoFocus
                        placeholder="Ask AI"
                        onKeyDownCapture={(e) => {
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

                            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                setUserScrolled(true);
                            }
                        }}
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
        </>
    );
};
