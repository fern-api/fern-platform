import { FacetFilter } from "@/hooks/useFacets";
import { UseSearch } from "@/hooks/useSearch";
import { FACET_DISPLAY_NAME_MAP, getFacetDisplay } from "@/utils/facet-display";
import { Command } from "cmdk";
import { Laptop, ListFilter, MessageCircle, Moon, Sun } from "lucide-react";
import { ComponentProps, Dispatch, SetStateAction, forwardRef, useRef, useState } from "react";
import { MarkRequired } from "ts-essentials";
import { PageIcon } from "../icons/PageIcon";
import { AskAIText } from "../shared/AskAIText";
import { HitContent } from "../shared/HitContent";
import "../shared/common.scss";
import { AlgoliaRecordHit } from "../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MobileFacetDialog } from "./MobileFacetDialog";
import "./mobile.scss";

export interface MobileCommandProps extends Omit<ComponentProps<typeof Command>, "onSelect"> {
    filters?: readonly FacetFilter[];
    setFilters?: Dispatch<SetStateAction<FacetFilter[]>>;
    onSelect: (path: string) => void;
    onAskAI?: ({ initialInput }: { initialInput?: string }) => void;
    setTheme?: (theme: "light" | "dark" | "system") => void;
}

interface InternalMobileCommandProps extends MobileCommandProps, UseSearch {}

export const MobileCommand = forwardRef<HTMLDivElement, InternalMobileCommandProps>((props, ref) => {
    const {
        filters = [],
        onSelect,
        onAskAI,
        setFilters,
        setTheme,
        query,
        refine,
        clear,
        groups,
        facets,
        preload,
        isLoading,
        children,
        ...rest
    } = props;

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const focus = () => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    return (
        <Command data-fern-docs-search-ui="mobile" ref={ref} {...rest}>
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
                <MobileFacetDialog filters={filters} setFilters={setFilters} />
                {isSearchOpen && (
                    <Button onClick={() => setIsSearchOpen(false)} className="shrink-0" variant="secondary">
                        Cancel
                    </Button>
                )}
            </div>
            {isSearchOpen ? (
                <Command.List
                    ref={scrollRef}
                    data-empty={groups.length === 0 && query.length === 0 && onAskAI == null && setTheme == null}
                    tabIndex={-1}
                >
                    {onAskAI != null && (
                        <Command.Group forceMount>
                            <Command.Item value="ai-chat" onSelect={() => onAskAI?.({ initialInput: query })}>
                                <MessageCircle />
                                <AskAIText query={query} />
                            </Command.Item>
                        </Command.Group>
                    )}

                    {facets.length > 0 && (
                        <Command.Group heading="Filters">
                            {facets.map((filter) => (
                                <Command.Item
                                    key={`${filter.facet}:${filter.value}`}
                                    onSelect={() => {
                                        setFilters?.([...filters, { facet: filter.facet, value: filter.value }]);
                                        clear();
                                        focus();
                                    }}
                                    onMouseOver={() => {
                                        preload({
                                            filters: [...filters, { facet: filter.facet, value: filter.value }],
                                        });
                                    }}
                                >
                                    <ListFilter />
                                    <span className="flex-1">Search {getFacetDisplay(filter.facet, filter.value)}</span>
                                    <span className="text-xs text-[#969696] dark:text-white/50 self-center">
                                        {filter.count}
                                    </span>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}

                    {groups.length === 0 && query.length > 0 && (
                        <Command.Empty>No results found for &ldquo;{query}&rdquo;.</Command.Empty>
                    )}

                    {groups.map((group, index) => (
                        <Command.Group key={group.title ?? index} heading={group.title ?? "Results"} forceMount>
                            {group.hits.map((hit) => (
                                <Command.Item key={hit.path} value={hit.path} onSelect={() => onSelect(hit.path)}>
                                    <PageIcon icon={hit.icon} type={hit.record?.type} />
                                    {hit.record != null && (
                                        <HitContent hit={hit.record as MarkRequired<AlgoliaRecordHit, "type">} />
                                    )}
                                    {hit.record == null && hit.title}
                                </Command.Item>
                            ))}
                        </Command.Group>
                    ))}

                    {setTheme != null && (
                        <Command.Group heading="Theme">
                            <Command.Item
                                value="light"
                                onSelect={() => setTheme?.("light")}
                                keywords={["light mode", "light theme"]}
                            >
                                <Sun />
                                Light
                            </Command.Item>
                            <Command.Item
                                value="dark"
                                onSelect={() => setTheme?.("dark")}
                                keywords={["dark mode", "dark theme"]}
                            >
                                <Moon />
                                Dark
                            </Command.Item>
                            <Command.Item
                                value="system"
                                onSelect={() => setTheme?.("system")}
                                keywords={["system mode", "system theme"]}
                            >
                                <Laptop />
                                System
                            </Command.Item>
                        </Command.Group>
                    )}
                </Command.List>
            ) : (
                <Command.List>{children}</Command.List>
            )}
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
