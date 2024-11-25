import { FacetFilter } from "@/hooks/use-facets";
import { FACET_DISPLAY_NAME_MAP } from "@/utils/facet-display";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { Command } from "cmdk";
import { ComponentProps, Dispatch, SetStateAction, forwardRef, useRef, useState } from "react";
import { CommandAskAIGroup } from "../shared/command-ask-ai";
import { CommandEmpty } from "../shared/command-empty";
import { CommandGroupFilters } from "../shared/command-filters";
import { CommandGroupSearchHits } from "../shared/command-hits";
import { CommandGroupTheme } from "../shared/command-theme";
import "../shared/common.scss";
import { useSearchContext } from "../shared/search-context-provider";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { Input } from "../ui/input";
import { MobileFacetMenuBar } from "./mobile-facet-menu-bar";
import "./mobile.scss";

export interface MobileCommandProps extends Omit<ComponentProps<typeof Command>, "onSelect"> {
    filters?: readonly FacetFilter[];
    setFilters?: Dispatch<SetStateAction<FacetFilter[]>>;
    onSelect: (path: string) => void;
    onAskAI?: ({ initialInput }: { initialInput?: string }) => void;
    setTheme?: (theme: "light" | "dark" | "system") => void;
    resetFilters?: () => void;
}

export const MobileCommand = forwardRef<HTMLDivElement, MobileCommandProps>((props, ref) => {
    const { filters = EMPTY_ARRAY, onSelect, onAskAI, setFilters, resetFilters, setTheme, children, ...rest } = props;
    const { query, refine, clear, items, facets } = useSearchContext();

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [masked, setMasked] = useState(false);

    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const scrollTop = () => {
        setTimeout(() => {
            scrollRef.current?.scrollTo({ top: 0 });
        }, 0);
    };

    const focus = () => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    return (
        <Command data-fern-docs-search-ui="mobile" ref={ref} {...rest} className="flex flex-col">
            <div data-cmdk-fern-header>
                <Command.Input
                    ref={inputRef}
                    autoFocus={false}
                    value={query}
                    placeholder={toPlaceholder(filters)}
                    onValueChange={(value) => {
                        refine(value);
                        setTimeout(() => {
                            scrollRef.current?.scrollTo({ top: 0 });
                        }, 0);
                    }}
                    maxLength={100}
                    asChild
                    onFocus={() => setIsSearchOpen(true)}
                >
                    <Input />
                </Command.Input>
                {isSearchOpen && (
                    <Button
                        onClick={() => {
                            setIsSearchOpen(false);
                            resetFilters?.();
                        }}
                        className="shrink-0"
                        variant="secondary"
                    >
                        Cancel
                    </Button>
                )}
            </div>
            {isSearchOpen && (
                <MobileFacetMenuBar
                    filters={filters}
                    setFilters={(filters) => {
                        setFilters?.(filters);
                        focus();
                        scrollTop();
                    }}
                />
            )}
            <Command.List
                ref={scrollRef}
                data-empty={items.length === 0 && query.length === 0 && onAskAI == null && setTheme == null}
                tabIndex={-1}
                className={cn("flex-1", {
                    "mask-grad-top-3": masked,
                })}
                onScroll={(e) => {
                    if (!(e.target instanceof HTMLElement)) {
                        return;
                    }
                    setMasked(e.target.scrollTop > 0);
                }}
            >
                {isSearchOpen ? (
                    <>
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
                    </>
                ) : (
                    children
                )}
            </Command.List>
        </Command>
    );
});

MobileCommand.displayName = "MobileCommand";

function toPlaceholder(filters: readonly FacetFilter[]): string {
    if (filters.length === 0) {
        return "Search";
    }

    return `Search ${filters.map((filter) => FACET_DISPLAY_NAME_MAP[filter.facet]?.[filter.value] ?? filter.value).join(", ")}`;
}
