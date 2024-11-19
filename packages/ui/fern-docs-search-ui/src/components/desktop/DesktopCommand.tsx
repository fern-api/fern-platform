import { FacetFilter } from "@/hooks/useFacets";
import { UseSearch } from "@/hooks/useSearch";
import { FACET_DISPLAY_NAME_MAP, getFacetDisplay } from "@/utils/facet-display";
import { Command } from "cmdk";
import { Laptop, ListFilter, MessageCircle, Moon, Sun } from "lucide-react";
import { ComponentProps, Dispatch, ReactNode, SetStateAction, forwardRef, useRef } from "react";
import { MarkRequired } from "ts-essentials";
import { PageIcon } from "../icons/PageIcon";
import { AskAIText } from "../shared/AskAIText";
import { HitContent } from "../shared/HitContent";
import { AlgoliaRecordHit } from "../types";
import { DesktopBackButton } from "./DesktopBackButton";
import { DesktopCloseTrigger } from "./DesktopCloseTrigger";
import { DesktopFilterDropdownMenu } from "./DesktopFilterDropdownMenu";

const ICON_CLASS = "size-4 shrink-0 my-1";

export interface DesktopCommandProps extends Omit<ComponentProps<typeof Command>, "onSelect"> {
    filters?: readonly FacetFilter[];
    onSelect: (path: string) => void;
    onAskAI?: ({ initialInput }: { initialInput?: string }) => void;
    setFilters?: Dispatch<SetStateAction<FacetFilter[]>>;
    setTheme?: (theme: "light" | "dark" | "system") => void;
    CloseTrigger?: ({ children }: { children: ReactNode }) => ReactNode;
    onClose?: () => void;
}

interface InternalDesktopCommandProps extends DesktopCommandProps, UseSearch {}

export const DesktopCommand = forwardRef<HTMLDivElement, InternalDesktopCommandProps>((props, ref) => {
    const {
        filters = [],
        onSelect,
        onAskAI,
        setFilters,
        setTheme,
        CloseTrigger,
        onClose,
        query,
        refine,
        clear,
        groups,
        facets,
        preload,
        ...rest
    } = props;

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const focus = () => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    return (
        <Command
            data-cmdk-fern-desktop
            ref={ref}
            {...rest}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    onClose?.();
                }
                rest.onKeyDown?.(e);
            }}
        >
            {filters.length > 0 && (
                <div className="flex items-center gap-2 p-2 pb-0" onClick={focus}>
                    {filters.map((filter) => (
                        <DesktopFilterDropdownMenu
                            key={`${filter.facet}:${filter.value}`}
                            filter={filter}
                            filters={filters}
                            removeFilter={() => {
                                setFilters?.((prev) => prev.filter((f) => f.facet !== filter.facet));
                                focus();
                            }}
                            updateFilter={(value) => {
                                setFilters?.((prev) =>
                                    prev.map((f) => (f.facet === filter.facet ? { ...f, value } : f)),
                                );
                                focus();
                            }}
                        />
                    ))}
                </div>
            )}
            <div data-cmdk-fern-header onClickCapture={focus}>
                {filters.length > 0 && (
                    <DesktopBackButton
                        pop={() => {
                            setFilters?.((lastFilters) => lastFilters.slice(0, -1));
                            focus();
                        }}
                        clear={() => {
                            setFilters?.([]);
                            focus();
                        }}
                    />
                )}
                <Command.Input
                    ref={inputRef}
                    autoFocus
                    value={query}
                    placeholder={toPlaceholder(filters)}
                    onValueChange={(value) => {
                        refine(value);
                        scrollRef.current?.scrollTo({ top: 0 });
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

                <DesktopCloseTrigger CloseTrigger={CloseTrigger} />
            </div>
            <Command.List
                ref={scrollRef}
                data-empty={groups.length === 0 && query.length === 0 && onAskAI == null && setTheme == null}
            >
                {onAskAI != null && (
                    <Command.Group forceMount>
                        <Command.Item value="ai-chat" onSelect={() => onAskAI?.({ initialInput: query })}>
                            <MessageCircle className={ICON_CLASS} />
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
                                <ListFilter className={ICON_CLASS} />
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
                                <PageIcon icon={hit.icon} type={hit.record?.type} className={ICON_CLASS} />
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
                            <Sun className={ICON_CLASS} />
                            Light
                        </Command.Item>
                        <Command.Item
                            value="dark"
                            onSelect={() => setTheme?.("dark")}
                            keywords={["dark mode", "dark theme"]}
                        >
                            <Moon className={ICON_CLASS} />
                            Dark
                        </Command.Item>
                        <Command.Item
                            value="system"
                            onSelect={() => setTheme?.("system")}
                            keywords={["system mode", "system theme"]}
                        >
                            <Laptop className={ICON_CLASS} />
                            System
                        </Command.Item>
                    </Command.Group>
                )}
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
