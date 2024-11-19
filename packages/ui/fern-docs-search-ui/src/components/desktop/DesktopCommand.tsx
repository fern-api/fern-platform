import { FacetFilter } from "@/hooks/useFacets";
import { useSearch } from "@/hooks/useSearch";
import { FACET_DISPLAY_NAME_MAP, getFacetDisplay } from "@/utils/facet-display";
import { Command } from "cmdk";
import { Laptop, ListFilter, MessageCircle, Moon, Sun } from "lucide-react";
import { Dispatch, ReactElement, ReactNode, SetStateAction, useRef } from "react";
import { MarkRequired } from "ts-essentials";
import { PageIcon } from "../icons/PageIcon";
import { HitContent } from "../shared/HitContent";
import { AlgoliaRecordHit } from "../types";
import { cn } from "../ui/cn";
import { BackButton } from "./DesktopBackButton";
import { DesktopCloseTrigger } from "./DesktopCloseTrigger";
import { DesktopFilterDropdownMenu } from "./DesktopFilterDropdownMenu";

const ICON_CLASS = "size-4 text-[#969696] dark:text-white/50 shrink-0 my-1";

function toPlaceholder(filters: { facet: string; value: string }[]): string {
    if (filters.length === 0) {
        return "Search";
    }

    return `Search ${filters.map((filter) => FACET_DISPLAY_NAME_MAP[filter.facet]?.[filter.value] ?? filter.value).join(", ")}`;
}

export function DesktopCommand({
    filters,
    onSubmit,
    onAskAI,
    setFilters,
    setTheme,
    CloseTrigger,
    onClose,
}: {
    filters: FacetFilter[];
    onSubmit: (path: string) => void;
    onAskAI?: ({ initialInput }: { initialInput?: string }) => void;
    setFilters?: Dispatch<SetStateAction<FacetFilter[]>>;
    setTheme?: (theme: "light" | "dark" | "system") => void;
    CloseTrigger?: ({ children }: { children: ReactNode }) => ReactNode;
    onClose?: () => void;
}): ReactNode {
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { query, refine, clear, groups, facets, preload } = useSearch({ filters });

    const focus = () => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    return (
        <Command
            ref={ref}
            className="flex flex-col border border-[#DBDBDB] dark:border-white/10 rounded-lg overflow-hidden bg-[#F2F2F2]/30 dark:bg-[#1A1919]/30 backdrop-blur-xl h-full"
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    onClose?.();
                }
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
            <div
                className="p-2 border-b last:border-b-0 border-[#DBDBDB] dark:border-white/10 flex items-center gap-0 cursor-text"
                onClickCapture={focus}
            >
                {filters.length > 0 && (
                    <BackButton
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
                    className="px-2 py-1 w-full focus:outline-none bg-transparent text-lg placeholder:text-[#969696] dark:placeholder:text-white/50"
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
                />

                <DesktopCloseTrigger CloseTrigger={CloseTrigger} />
            </div>
            <Command.List
                className="py-3 min-h-0 shrink overflow-auto mask-grad-y-3 overscroll-contain"
                ref={scrollRef}
            >
                {onAskAI != null && (
                    <Command.Group forceMount>
                        <CommandItem value="ai-chat" onSelect={() => onAskAI?.({ initialInput: query })}>
                            <MessageCircle className={ICON_CLASS} />
                            <span>
                                Ask AI
                                {query.trimStart().length > 0 && (
                                    <>
                                        <span className="ms-1">&ldquo;</span>
                                        <span className="font-semibold">{query}</span>
                                        <span>&rdquo;</span>
                                    </>
                                )}
                            </span>
                        </CommandItem>
                    </Command.Group>
                )}

                {facets.length > 0 && (
                    <Command.Group heading="Filters">
                        {facets.map((filter) => (
                            <CommandItem
                                key={`${filter.facet}:${filter.value}`}
                                onSelect={() => {
                                    setFilters?.([...filters, { facet: filter.facet, value: filter.value }]);
                                    clear();
                                    focus();
                                }}
                                onMouseOver={() => {
                                    preload({ filters: [...filters, { facet: filter.facet, value: filter.value }] });
                                }}
                            >
                                <ListFilter className={ICON_CLASS} />
                                <span className="flex-1">Search {getFacetDisplay(filter.facet, filter.value)}</span>
                                <span className="text-xs text-[#969696] dark:text-white/50 self-center">
                                    {filter.count}
                                </span>
                            </CommandItem>
                        ))}
                    </Command.Group>
                )}

                {groups.length === 0 && (
                    <Command.Empty className="p-4 pb-6 text-center text-[#969696] dark:text-white/50">
                        No results found for &ldquo;{query}&rdquo;.
                    </Command.Empty>
                )}

                {groups.map((group, index) => (
                    <Command.Group key={group.title ?? index} heading={group.title ?? "Results"} forceMount>
                        {group.hits.map((hit) => (
                            <CommandItem key={hit.path} value={hit.path} onSelect={() => onSubmit(hit.path)}>
                                <PageIcon icon={hit.icon} type={hit.record?.type} className={ICON_CLASS} />
                                {hit.record != null && (
                                    <HitContent hit={hit.record as MarkRequired<AlgoliaRecordHit, "type">} />
                                )}
                                {hit.record == null && hit.title}
                            </CommandItem>
                        ))}
                    </Command.Group>
                ))}

                {setTheme != null && (
                    <Command.Group heading="Theme">
                        <CommandItem value="light" onSelect={() => setTheme?.("light")}>
                            <Sun className={ICON_CLASS} />
                            Light
                        </CommandItem>
                        <CommandItem value="dark" onSelect={() => setTheme?.("dark")}>
                            <Moon className={ICON_CLASS} />
                            Dark
                        </CommandItem>
                        <CommandItem value="system" onSelect={() => setTheme?.("system")}>
                            <Laptop className={ICON_CLASS} />
                            System
                        </CommandItem>
                    </Command.Group>
                )}
            </Command.List>
        </Command>
    );
}

function CommandItem({
    className,
    children,
    ...props
}: React.ComponentPropsWithoutRef<typeof Command.Item>): ReactElement {
    return (
        <Command.Item {...props} className={cn("flex gap-2 cursor-default scroll-my-3", className)}>
            {children}
        </Command.Item>
    );
}
