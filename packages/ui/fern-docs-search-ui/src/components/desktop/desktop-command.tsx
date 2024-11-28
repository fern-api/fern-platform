import { FacetFilter } from "@/hooks/use-facets";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { Badge } from "@fern-ui/fern-docs-badges";
import { composeEventHandlers } from "@radix-ui/primitive";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { Message } from "ai";
import { Command } from "cmdk";
import { useAtomValue } from "jotai";
import { CircleStop, Copy, CornerDownLeft, RefreshCcw, Sparkles, User } from "lucide-react";
import { ComponentProps, Dispatch, ReactElement, SetStateAction, forwardRef, useRef, useState } from "react";
import { Components } from "react-markdown";
import { FootnoteSup, FootnotesSection } from "../chatbot/footnote";
import { ChatbotTurnContextProvider, useChatbotTurnContext } from "../chatbot/turn-context";
import { useAskAI } from "../chatbot/use-ask-ai";
import { combineSearchResults, squeezeMessages } from "../chatbot/utils";
import { MarkdownContent } from "../md-content";
import { CommandAskAIGroup } from "../shared/command-ask-ai";
import { CommandEmpty } from "../shared/command-empty";
import { CommandGroupFilters } from "../shared/command-filters";
import { CommandGroupSearchHits } from "../shared/command-hits";
import { CommandGroupTheme } from "../shared/command-theme";
import "../shared/common.scss";
import { useSearchContext } from "../shared/search-context-provider";
import { Button } from "../ui/button";
import { CopyToClipboard } from "../ui/copy-to-clipboard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { DesktopBackButton } from "./desktop-back-button";
import { DesktopCloseTrigger } from "./desktop-close-trigger";
import { DesktopFilterDropdownMenu } from "./desktop-filter-dropdown-menu";
import "./desktop.scss";
import { Suggestions } from "./suggestions";

export type DesktopCommandSharedProps = Omit<ComponentProps<typeof Command>, "onSelect" | "children">;

export interface DesktopCommandProps extends DesktopCommandSharedProps {
    filters?: readonly FacetFilter[];
    onSelect: (path: string) => void;
    resetFilters?: () => void;
    // onAskAI?: ({ initialInput }: { initialInput?: string }) => void;
    setFilters?: Dispatch<SetStateAction<FacetFilter[]>>;
    setTheme?: (theme: "light" | "dark" | "system") => void;
    onClose?: () => void;
    headers?: Record<string, string>;
    components?: Components;
    systemContext?: Record<string, string>;
}

/**
 * The desktop command is intended to be used within a dialog component.
 */
export const DesktopCommand = forwardRef<HTMLDivElement, DesktopCommandProps>((props, ref) => {
    const {
        filters = EMPTY_ARRAY,
        onSelect,
        // onAskAI,
        setFilters,
        resetFilters,
        setTheme,
        onClose,
        headers,
        components,
        systemContext,
        ...rest
    } = props;
    const { query, refine, clear, items } = useSearchContext();
    const [inputError, setInputError] = useState<string | null>(null);
    const [isAskAI, setIsAskAI] = useState(false);
    const chat = useAskAI({
        initialInput: query,
        headers,
        systemContext,
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const focus = () => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const scrollTop = () => {
        setTimeout(() => {
            scrollRef.current?.scrollTo({ top: 0 });
        }, 0);
    };

    const askAI = (message: string) => {
        setIsAskAI(true);

        if (message.trim().split(/\s+/).length < 2) {
            if (message.length > 0) {
                setInputError("Enter at least 2 words");
            }
            focus();
            return;
        } else {
            setInputError(null);
        }

        void chat.append({
            role: "user",
            content: message,
        });
        clear();
        focus();
    };

    return (
        <Command
            data-fern-docs-search-ui="desktop"
            ref={ref}
            {...rest}
            onKeyDownCapture={composeEventHandlers(
                rest.onKeyDownCapture,
                (e) => {
                    setInputError(null);
                    if (e.key === "Escape") {
                        if (isAskAI) {
                            setIsAskAI(false);
                            focus();
                            scrollTop();
                        } else if (query.length > 0) {
                            clear();
                            focus();
                            scrollTop();
                        } else if (filters.length > 0) {
                            if (e.metaKey) {
                                setFilters?.([]);
                            } else {
                                setFilters?.((lastFilters) => lastFilters.slice(0, -1));
                            }
                            focus();
                            scrollTop();
                        } else {
                            onClose?.();
                        }
                        e.stopPropagation();
                        return;
                    }

                    if (document.activeElement === inputRef.current) {
                        return;
                    }

                    if (/^[a-zA-Z0-9]$/.test(e.key)) {
                        focus();
                    }
                },
                { checkForDefaultPrevented: false },
            )}
        >
            {(filters.length > 0 || isAskAI) && (
                <div className="flex items-center gap-2 p-2 pb-0 cursor-text" onClick={focus}>
                    {filters.map((filter) => (
                        <DesktopFilterDropdownMenu
                            key={`${filter.facet}:${filter.value}`}
                            filter={filter}
                            filters={filters}
                            removeFilter={() => {
                                setFilters?.((prev) => prev.filter((f) => f.facet !== filter.facet));
                            }}
                            updateFilter={(value) => {
                                setFilters?.((prev) =>
                                    prev.map((f) => (f.facet === filter.facet ? { ...f, value } : f)),
                                );
                            }}
                            onClose={() => {
                                focus();
                                scrollTop();
                            }}
                        />
                    ))}

                    {isAskAI && (
                        <Badge size="sm" variant="outlined-subtle">
                            Ask AI
                        </Badge>
                    )}
                </div>
            )}
            <div data-cmdk-fern-header onClick={focus}>
                {(filters.length > 0 || isAskAI) && (
                    <DesktopBackButton
                        pop={() => {
                            if (isAskAI) {
                                setIsAskAI(false);
                            } else {
                                setFilters?.((lastFilters) => lastFilters.slice(0, -1));
                            }
                            focus();
                            scrollTop();
                        }}
                        clear={() => {
                            setIsAskAI(false);
                            setFilters?.([]);
                            focus();
                            scrollTop();
                        }}
                    />
                )}

                <TooltipProvider>
                    <Tooltip open={inputError != null}>
                        <TooltipTrigger asChild>
                            <Command.Input
                                ref={inputRef}
                                inputMode="search"
                                autoFocus
                                value={query}
                                placeholder={isAskAI ? "Ask AI" : "Search"}
                                onValueChange={(value) => {
                                    refine(value);
                                    scrollTop();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && isAskAI) {
                                        e.preventDefault();
                                        askAI(query);
                                        return;
                                    }

                                    if (e.key === "Backspace" && query.length === 0) {
                                        if (isAskAI) {
                                            setIsAskAI(false);
                                            focus();
                                            scrollTop();
                                        } else if (e.metaKey) {
                                            setFilters?.([]);
                                        } else {
                                            setFilters?.((lastFilters) => lastFilters.slice(0, -1));
                                        }
                                        focus();
                                    }
                                }}
                                maxLength={100}
                            />
                        </TooltipTrigger>
                        <TooltipPortal>
                            <TooltipContent side="bottom" align="start">
                                <p>{inputError}</p>
                            </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                </TooltipProvider>

                {onClose != null && !isAskAI && <DesktopCloseTrigger onClose={onClose} />}
                {isAskAI && !chat.isLoading && (
                    <Button variant="ghost" size="iconSm" onClick={() => askAI(query)} className="shrink-0">
                        <CornerDownLeft />
                    </Button>
                )}
                {isAskAI && chat.isLoading && (
                    <Button variant="ghost" size="iconSm" className="shrink-0" onClick={() => chat.stop()}>
                        <CircleStop />
                    </Button>
                )}
            </div>
            <Command.List
                ref={scrollRef}
                data-empty={items.length === 0 && query.length === 0 && setTheme == null}
                tabIndex={-1}
            >
                {!isAskAI && (
                    <CommandAskAIGroup
                        query={query.trim().split(/\s+/).length < 2 ? "" : query.trim()}
                        onAskAI={askAI}
                        forceMount
                    />
                )}

                {isAskAI && (
                    <AskAICommandItems
                        messages={chat.messages}
                        headers={headers}
                        askAI={(message) => {
                            askAI(message);
                            focus();
                            scrollTop();
                        }}
                        onSelectHit={onSelect}
                        components={components}
                        isLoading={chat.isLoading}
                        refreshLastMessage={() => {
                            void chat.reload();
                            focus();
                            scrollTop();
                        }}
                    />
                )}

                {!isAskAI && (
                    <SearchResultsCommandItems
                        filters={filters}
                        onSelectHit={onSelect}
                        onSelectFilter={(filter) => {
                            setFilters?.([...filters, filter]);
                            clear();
                            focus();
                            scrollTop();
                        }}
                        setTheme={setTheme}
                    />
                )}
            </Command.List>
        </Command>
    );
});

DesktopCommand.displayName = "DesktopCommand";

const SearchResultsCommandItems = ({
    filters,
    onSelectHit,
    onSelectFilter,
    setTheme,
}: {
    filters: readonly FacetFilter[];
    onSelectHit: (path: string) => void;
    onSelectFilter: (filter: FacetFilter) => void;
    setTheme?: (theme: "light" | "dark" | "system") => void;
}): ReactElement => {
    const { query, items, facets } = useSearchContext();
    return (
        <>
            <CommandGroupFilters facets={facets} onSelect={onSelectFilter} />

            {items.length === 0 && <CommandEmpty />}

            {(query.trimStart().length > 0 || filters.length > 0) && (
                <CommandGroupSearchHits items={items} onSelect={onSelectHit} />
            )}

            {filters.length === 0 && <CommandGroupTheme setTheme={setTheme} />}
        </>
    );
};

const AskAICommandItems = ({
    messages,
    headers,
    askAI,
    onSelectHit,
    components,
    isLoading,
    refreshLastMessage,
}: {
    messages: Message[];
    headers?: Record<string, string>;
    askAI: (message: string) => void;
    onSelectHit: (path: string) => void;
    components?: Components;
    isLoading?: boolean;
    refreshLastMessage?: () => void;
}): ReactElement => {
    const squeezedMessages = squeezeMessages(messages);
    if (squeezedMessages.length === 0) {
        return (
            <>
                <div className="flex gap-4 p-2">
                    <Sparkles className="size-4 shrink-0 my-1" />
                    <div className="space-y-2">
                        <p>Hi, I&apos;m an AI assistant with access to documentation and other content.</p>
                    </div>
                </div>

                <Suggestions headers={headers} askAI={askAI} />
            </>
        );
    }

    return (
        <>
            {squeezedMessages.map((message, idx) => {
                const searchResults = combineSearchResults([message]);
                const Icon = message.role === "assistant" ? Sparkles : User;
                return (
                    <ChatbotTurnContextProvider key={message.id}>
                        <article id={`_${message.id}`}>
                            <div className="flex gap-4 px-2">
                                <Icon className="size-4 shrink-0 my-1" />
                                <section className="prose prose-sm dark:prose-invert">
                                    <MarkdownContent
                                        components={{
                                            ...components,
                                            sup: FootnoteSup,
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
                                            section: ({ children, node, ...props }) => {
                                                if (node?.properties["dataFootnotes"]) {
                                                    return (
                                                        <FootnotesSection node={node} searchResults={searchResults} />
                                                    );
                                                }

                                                return <section {...props}>{children}</section>;
                                            },
                                        }}
                                    >
                                        {message.content}
                                    </MarkdownContent>
                                    {isLoading &&
                                        message.toolInvocations?.some(
                                            (invocation) => invocation.state !== "result",
                                        ) && <p className="text-[var(--grayscale-a10)]">Thinking...</p>}
                                </section>
                            </div>
                            {!isLoading && message.role === "assistant" && idx === squeezedMessages.length - 1 && (
                                <div className="flex gap-1 ml-auto px-2">
                                    <CopyToClipboard content={message.content}>
                                        <Button variant="ghost" size="iconSm">
                                            <Copy />
                                        </Button>
                                    </CopyToClipboard>
                                    <Button variant="ghost" size="iconSm" onClick={refreshLastMessage}>
                                        <RefreshCcw />
                                    </Button>
                                </div>
                            )}
                        </article>
                        <FootnoteCommands onSelect={onSelectHit} />
                    </ChatbotTurnContextProvider>
                );
            })}
        </>
    );
};

function FootnoteCommands({ onSelect }: { onSelect: (path: string) => void }) {
    const { footnotesAtom } = useChatbotTurnContext();
    const footnotes = useAtomValue(footnotesAtom);
    return (
        <>
            {footnotes.map((footnote, idx) => (
                <Command.Item key={footnote.ids.join("-")} onSelect={() => onSelect(footnote.url)}>
                    <Badge rounded>{String(idx + 1)}</Badge>
                    <span>{footnote.title}</span>
                </Command.Item>
            ))}
        </>
    );
}
