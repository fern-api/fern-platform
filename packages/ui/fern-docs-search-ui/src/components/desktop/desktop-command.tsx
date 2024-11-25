import { FacetFilter } from "@/hooks/use-facets";
import { FACET_DISPLAY_NAME_MAP } from "@/utils/facet-display";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { composeEventHandlers } from "@radix-ui/primitive";
import { Command } from "cmdk";
import { ComponentProps, Dispatch, SetStateAction, forwardRef, useRef } from "react";
import { CommandAskAIGroup } from "../shared/command-ask-ai";
import { CommandEmpty } from "../shared/command-empty";
import { CommandGroupFilters } from "../shared/command-filters";
import { CommandGroupSearchHits } from "../shared/command-hits";
import { CommandGroupTheme } from "../shared/command-theme";
import "../shared/common.scss";
import { useSearchContext } from "../shared/search-context-provider";
import { DesktopBackButton } from "./desktop-back-button";
import { DesktopCloseTrigger } from "./desktop-close-trigger";
import { DesktopFilterDropdownMenu } from "./desktop-filter-dropdown-menu";
import "./desktop.scss";

export type DesktopCommandSharedProps = Omit<ComponentProps<typeof Command>, "onSelect" | "children">;

export interface DesktopCommandProps extends DesktopCommandSharedProps {
    filters?: readonly FacetFilter[];
    onSelect: (path: string) => void;
    resetFilters?: () => void;
    onAskAI?: ({ initialInput }: { initialInput?: string }) => void;
    setFilters?: Dispatch<SetStateAction<FacetFilter[]>>;
    setTheme?: (theme: "light" | "dark" | "system") => void;
    onClose?: () => void;
}

/**
 * The desktop command is intended to be used within a dialog component.
 */
export const DesktopCommand = forwardRef<HTMLDivElement, DesktopCommandProps>((props, ref) => {
    const { filters = EMPTY_ARRAY, onSelect, onAskAI, setFilters, resetFilters, setTheme, onClose, ...rest } = props;
    const { query, refine, clear, items, facets } = useSearchContext();

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

    return (
        <Command
            data-fern-docs-search-ui="desktop"
            ref={ref}
            {...rest}
            onKeyDown={composeEventHandlers(
                rest.onKeyDown,
                (e) => {
                    if (e.key === "Escape") {
                        onClose?.();
                    }

                    if (document.activeElement === inputRef.current) {
                        return;
                    }

                    if (/^[a-zA-Z0-9]$/.test(e.key)) {
                        refine(query + e.key);
                        focus();
                    }
                },
                { checkForDefaultPrevented: true },
            )}
        >
            {filters.length > 0 && (
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
                </div>
            )}
            <div data-cmdk-fern-header onClick={focus}>
                {filters.length > 0 && (
                    <DesktopBackButton
                        pop={() => {
                            setFilters?.((lastFilters) => lastFilters.slice(0, -1));
                            focus();
                            scrollTop();
                        }}
                        clear={() => {
                            setFilters?.([]);
                            focus();
                            scrollTop();
                        }}
                    />
                )}
                <Command.Input
                    ref={inputRef}
                    inputMode="search"
                    autoFocus
                    value={query}
                    placeholder={toPlaceholder(filters)}
                    onValueChange={(value) => {
                        refine(value);
                        scrollTop();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Backspace" && query.length === 0) {
                            if (e.metaKey) {
                                setFilters?.([]);
                            } else {
                                setFilters?.((lastFilters) => lastFilters.slice(0, -1));
                            }
                            focus();
                        }
                    }}
                    maxLength={100}
                />

                {onClose != null && <DesktopCloseTrigger onClose={onClose} />}
            </div>
            <Command.List
                ref={scrollRef}
                data-empty={items.length === 0 && query.length === 0 && onAskAI == null && setTheme == null}
                tabIndex={-1}
            >
                {onAskAI != null && <CommandAskAIGroup query={query} onAskAI={onAskAI} forceMount />}

                <CommandGroupFilters
                    facets={facets}
                    onSelect={(filter) => {
                        setFilters?.([...filters, filter]);
                        clear();
                        focus();
                        scrollTop();
                    }}
                />

                {items.length === 0 && <CommandEmpty />}

                {(query.trimStart().length > 0 || filters.length > 0) && (
                    <CommandGroupSearchHits items={items} onSelect={onSelect} />
                )}

                <CommandGroupTheme setTheme={setTheme} />
            </Command.List>
        </Command>
    );
});

DesktopCommand.displayName = "DesktopCommand";

function toPlaceholder(filters: readonly FacetFilter[]): string {
    if (filters.length === 0) {
        return "Search";
    }

    return `Search ${filters.map((filter) => FACET_DISPLAY_NAME_MAP[filter.facet]?.[filter.value] ?? filter.value).join(", ")}`;
}
