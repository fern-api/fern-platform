import { useFacets } from "@/hooks/useFacets";
import { FACET_DISPLAY_NAME_MAP, FacetName, getFacets, toFilterOptions } from "@/utils/facet";
import { getFacetDisplay } from "@/utils/facet-display";
import { toFiltersString } from "@/utils/to-filter-string";
import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { TooltipPortal, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Command } from "cmdk";
import { ArrowLeft, FileText, History, ListFilter, MessageCircle } from "lucide-react";
import { Dispatch, ReactElement, SetStateAction, useRef } from "react";
import { useHits, useSearchBox } from "react-instantsearch";
import { preload } from "swr";
import { MarkRequired } from "ts-essentials";
import { RemoteIcon } from "../icons/RemoteIcon";
import { HitContent } from "../shared/HitContent";
import { generateHits } from "../shared/hits";
import { AlgoliaRecordHit } from "../types";
import { Button } from "../ui/button";
import { Kbd } from "../ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider } from "../ui/tooltip";
import { FilterDropdownMenu } from "./FilterDropdownMenu";

const ICON_CLASS = "size-4 text-[#969696] dark:text-white/50 shrink-0 my-1";

function toPlaceholder(filters: { facet: string; value: string }[]): string {
    if (filters.length === 0) {
        return "Search";
    }

    return `Search ${filters.map((filter) => FACET_DISPLAY_NAME_MAP[filter.facet]?.[filter.value] ?? filter.value).join(", ")}`;
}

export function DesktopCommand({
    domain,
    appId,
    apiKey,
    onSubmit,
    onAskAI,
    filters,
    setFilters,
}: {
    domain: string;
    appId: string;
    apiKey: string;
    onSubmit: (path: string) => void;
    onAskAI?: ({ initialInput }: { initialInput?: string }) => void;
    filters: {
        facet: FacetName;
        value: string;
    }[];
    setFilters?: Dispatch<SetStateAction<{ facet: FacetName; value: string }[]>>;
}): ReactElement {
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { query, refine } = useSearchBox();

    const { items } = useHits<AlgoliaRecord>();

    const { data: facets } = useFacets({ appId, apiKey, domain, filters });

    const groups = generateHits(items);

    const filterOptions = toFilterOptions(facets, query);

    return (
        <Command
            ref={ref}
            className="flex flex-col border border-[#DBDBDB] dark:border-white/10 rounded-lg overflow-hidden bg-[#F2F2F2]/30 dark:bg-[#1A1919]/30 backdrop-blur-xl h-full"
            shouldFilter={false}
        >
            {filters.length > 0 && (
                <div className="flex items-center gap-2 p-4 pb-0 -mb-1">
                    {filters.map((filter) => (
                        <FilterDropdownMenu
                            key={`${filter.facet}:${filter.value}`}
                            appId={appId}
                            apiKey={apiKey}
                            domain={domain}
                            filter={filter}
                            filters={filters}
                            removeFilter={() => {
                                setFilters?.((prev) => prev.filter((f) => f.facet !== filter.facet));
                                setTimeout(() => {
                                    inputRef.current?.focus();
                                }, 0);
                            }}
                            updateFilter={(value) => {
                                setFilters?.((prev) =>
                                    prev.map((f) => (f.facet === filter.facet ? { ...f, value } : f)),
                                );
                                setTimeout(() => {
                                    inputRef.current?.focus();
                                }, 0);
                            }}
                        />
                    ))}
                </div>
            )}
            <div
                className="p-4 border-b last:border-b-0 border-[#DBDBDB] dark:border-white/10 flex items-center gap-2 cursor-text"
                onClickCapture={() => {
                    inputRef.current?.focus();
                }}
            >
                {filters.length > 0 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="iconSm"
                                    variant="outline"
                                    className="shrink-0"
                                    onClick={(e) => {
                                        if (e.metaKey) {
                                            setFilters?.([]);
                                        } else {
                                            setFilters?.((lastFilters) => lastFilters.slice(0, -1));
                                        }
                                        inputRef.current?.focus();
                                    }}
                                >
                                    <ArrowLeft />
                                </Button>
                            </TooltipTrigger>
                            <TooltipPortal>
                                <TooltipContent className="shrink-0">
                                    <p>
                                        <Kbd className="me-1">del</Kbd>
                                        <span> to go back or </span>
                                        <Kbd className="mx-1">⌘</Kbd>
                                        <Kbd className="me-1">del</Kbd>
                                        <span> to go to root search</span>
                                    </p>
                                </TooltipContent>
                            </TooltipPortal>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <Command.Input
                    ref={inputRef}
                    className="w-full focus:outline-none bg-transparent text-lg placeholder:text-[#969696] dark:placeholder:text-white/50"
                    autoFocus
                    value={query}
                    placeholder={toPlaceholder(filters)}
                    onValueChange={refine}
                    onKeyDown={(e) => {
                        if (e.key === "Backspace" && query.length === 0) {
                            if (e.metaKey) {
                                setFilters?.([]);
                            } else {
                                setFilters?.((lastFilters) => lastFilters.slice(0, -1));
                            }
                            inputRef.current?.focus();
                        }
                    }}
                />

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="xs" variant="outline">
                                <kbd>esc</kbd>
                            </Button>
                        </TooltipTrigger>
                        <TooltipPortal>
                            <TooltipContent>
                                <p>Close search</p>
                            </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <Command.Empty className="p-4 pb-6 text-center text-[#969696] dark:text-white/50">
                No results found
            </Command.Empty>
            <Command.List className="py-3 min-h-0 shrink overflow-auto mask-grad-y-3">
                <Command.Group>
                    <Command.Item
                        value="ai-chat"
                        className="flex gap-2 cursor-default"
                        onSelect={() => onAskAI?.({ initialInput: query })}
                    >
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
                    </Command.Item>
                </Command.Group>

                {filterOptions.length > 0 && (
                    <Command.Group heading="Filters">
                        {filterOptions.map((filter) => (
                            <Command.Item
                                key={`${filter.facet}:${filter.value}`}
                                className="flex gap-2 cursor-default items-center"
                                onSelect={() => {
                                    setFilters?.([...filters, { facet: filter.facet, value: filter.value }]);
                                    inputRef.current?.focus();
                                }}
                                onMouseOver={() => {
                                    const filterString = toFiltersString([
                                        ...filters,
                                        { facet: filter.facet, value: filter.value },
                                    ]);
                                    preload([domain, filterString], ([_domain, filters]) =>
                                        getFacets({ appId, apiKey, filters }),
                                    );
                                }}
                            >
                                <ListFilter className={ICON_CLASS} />
                                <span className="flex-1">Search {getFacetDisplay(filter.facet, filter.value)}</span>
                                <span className="text-xs text-[#969696] dark:text-white/50">{filter.count}</span>
                            </Command.Item>
                        ))}
                    </Command.Group>
                )}

                {groups.map((group, index) => (
                    <Command.Group key={group.title ?? index} heading={group.title ?? "Results"}>
                        {group.hits.map((hit) => (
                            <Command.Item
                                key={hit.path}
                                value={hit.path}
                                onSelect={() => onSubmit(hit.path)}
                                className="flex gap-2 cursor-default"
                            >
                                <Icon icon={hit.icon} type={hit.record?.type} />
                                {hit.record != null && (
                                    <HitContent hit={hit.record as MarkRequired<AlgoliaRecordHit, "type">} />
                                )}
                                {hit.record == null && hit.title}
                            </Command.Item>
                        ))}
                    </Command.Group>
                ))}
            </Command.List>
        </Command>
    );
}

function Icon({ icon, type }: { icon: string | undefined; type: string | undefined }): ReactElement {
    if (icon) {
        return <RemoteIcon icon={icon} className={ICON_CLASS} />;
    }

    if (type === "changelog") {
        return <History className={ICON_CLASS} />;
    }

    return <FileText className={ICON_CLASS} />;
}
