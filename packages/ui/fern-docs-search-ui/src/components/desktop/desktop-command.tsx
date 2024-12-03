import { FacetFilter } from "@/hooks/use-facets";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { composeEventHandlers } from "@radix-ui/primitive";
import { Command } from "cmdk";
import { CircleStop, CornerDownLeft } from "lucide-react";
import {
    ComponentProps,
    Dispatch,
    KeyboardEvent,
    ReactElement,
    SetStateAction,
    forwardRef,
    useRef,
    useState,
} from "react";
import { Components } from "react-markdown";
import { useAskAI } from "../chatbot/use-ask-ai";
import { CommandAskAIGroup } from "../shared/command-ask-ai";
import { CommandEmpty } from "../shared/command-empty";
import { CommandGroupFilters } from "../shared/command-filters";
import { CommandGroupSearchHits } from "../shared/command-hits";
import { CommandGroupTheme } from "../shared/command-theme";
import "../shared/common.scss";
import { useSearchContext } from "../shared/search-context-provider";
import { Button } from "../ui/button";
import { AskAICommandItems } from "./desktop-ask-ai-conversation";
import { DesktopBackButton } from "./desktop-back-button";
import { DesktopCloseTrigger } from "./desktop-close-trigger";
import { DesktopCommandBadges } from "./desktop-command-badges";
import { DesktopCommandInput } from "./desktop-command-input";
import "./desktop.scss";

export type DesktopCommandSharedProps = Omit<ComponentProps<typeof Command>, "onSelect" | "children">;

export interface DesktopCommandProps extends DesktopCommandSharedProps {
    filters?: readonly FacetFilter[];
    onSelect: (path: string) => void;
    resetFilters?: () => void;
    setFilters?: Dispatch<SetStateAction<FacetFilter[]>>;
    setTheme?: (theme: "light" | "dark" | "system") => void;
    onClose?: () => void;
    headers?: Record<string, string>;
    components?: Components;
    systemContext?: Record<string, string>;
    isAskAIEnabled?: boolean;
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
        isAskAIEnabled = false,
        ...rest
    } = props;
    const { query, refine, clear, items } = useSearchContext();
    const [inputError, setInputError] = useState<string | null>(null);
    const [isAskAIInternal, setIsAskAI] = useState(false);
    const isAskAI = isAskAIEnabled && isAskAIInternal;
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

    const onEsc = (e: KeyboardEvent<HTMLDivElement>) => {
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
    };

    return (
        <Command
            data-fern-docs-search-ui="desktop"
            ref={ref}
            {...rest}
            onKeyDownCapture={composeEventHandlers(
                rest.onKeyDownCapture,
                (e) => {
                    // on keydown, clear input error
                    setInputError(null);

                    // if escape, handle it
                    if (e.key === "Escape") {
                        return onEsc(e);
                    }

                    // if input is focused, do nothing
                    if (document.activeElement === inputRef.current) {
                        return;
                    }

                    // if input is alphanumeric, focus input
                    // note: this func is onKeyDownCapture so it will fire before the input
                    // which is important so that the first character typed isn't swallowed
                    if (/^[a-zA-Z0-9]$/.test(e.key)) {
                        focus();
                    }
                },
                { checkForDefaultPrevented: false },
            )}
        >
            <DesktopCommandBadges
                filters={filters}
                isAskAI={isAskAI}
                setFilters={setFilters}
                onClick={focus}
                onDropdownClose={() => {
                    focus();
                    scrollTop();
                }}
            />

            {/* header */}
            <div data-cmdk-fern-header="" onClick={focus}>
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

                <DesktopCommandInput
                    ref={inputRef}
                    inputError={inputError}
                    query={query}
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
                />

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

            {/* body */}
            <Command.List
                ref={scrollRef}
                data-empty={items.length === 0 && query.length === 0 && setTheme == null ? "" : undefined}
                tabIndex={-1}
            >
                {!isAskAI && isAskAIEnabled && (
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
