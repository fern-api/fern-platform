import { useSearchHits } from "@/hooks/use-search-hits";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { Command, useCommandState } from "cmdk";
import { PropsWithChildren, ReactNode, memo } from "react";
import { Snippet } from "react-instantsearch";
import { PageIcon } from "../icons/page";
import { useFacetFilters } from "../search-client";
import { AlgoliaRecordHit } from "../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { HitContent } from "./hit-content";
import { generateHits } from "./hits";

export const CommandSearchHits = ({
    onSelect,
    prefetch,
}: {
    onSelect: (path: string) => void;
    prefetch?: (path: string) => Promise<void>;
}): ReactNode => {
    const isQueryEmpty = useCommandState((state) => state.search.trimStart().length === 0) as boolean;
    const items = useSearchHits();
    const { filters } = useFacetFilters();

    if ((filters.length === 0 && isQueryEmpty) || items.length === 0) {
        return false;
    }

    return <MemoizedCommandSearchHits items={items} onSelect={onSelect} prefetch={prefetch} />;
};

const MemoizedCommandSearchHits = memo(
    ({
        items,
        onSelect,
        prefetch,
    }: {
        items: AlgoliaRecordHit[];
        onSelect: (path: string) => void;
        prefetch?: (path: string) => Promise<void>;
    }) => {
        const groups = generateHits(items);

        return (
            <TooltipProvider>
                {groups.map((group, index) => (
                    <Command.Group key={group.title ?? index} heading={group.title ?? "Results"} forceMount>
                        {group.hits.map((hit) => {
                            if (!hit.record) {
                                return false;
                            }

                            return (
                                <CommandGroupSearchHitTooltip key={hit.path} hit={hit.record} path={hit.path}>
                                    <Command.Item
                                        value={hit.path}
                                        onSelect={() => onSelect(hit.path)}
                                        keywords={[hit.record.title]}
                                        onPointerOver={() => {
                                            void prefetch?.(hit.path);
                                        }}
                                    >
                                        <PageIcon
                                            icon={hit.icon}
                                            type={
                                                hit.record.type === "api-reference"
                                                    ? hit.record.api_type
                                                    : hit.record.type
                                            }
                                            isSubPage={hit.record.hash != null}
                                            className="self-start"
                                        />
                                        <HitContent hit={hit.record} />
                                    </Command.Item>
                                </CommandGroupSearchHitTooltip>
                            );
                        })}
                    </Command.Group>
                ))}
            </TooltipProvider>
        );
    },
);

MemoizedCommandSearchHits.displayName = "MemoizedCommandSearchHits";

function CommandGroupSearchHitTooltip({
    hit,
    path,
    children,
}: PropsWithChildren<{ hit: AlgoliaRecordHit; path: string }>) {
    const open = useCommandState((state) => state.value === path) as boolean;

    if (hit._snippetResult?.content == null && hit._snippetResult?.description == null) {
        return children;
    }

    return (
        <MemoizedTooltip hit={hit} open={open}>
            {children}
        </MemoizedTooltip>
    );
}

const MemoizedTooltip = memo(({ children, hit, open }: PropsWithChildren<{ hit: AlgoliaRecordHit; open: boolean }>) => (
    <Tooltip open={open}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipPortal>
            <TooltipContent
                side="right"
                sideOffset={16}
                align="start"
                className="max-w-[var(--radix-tooltip-content-available-width)] max-h-[var(--radix-tooltip-content-available-height)] [&_mark]:bg-[var(--accent-a3)] [&_mark]:text-[var(--accent-a11)] space-y-2"
                avoidCollisions
                animate={false}
                collisionPadding={10}
            >
                {hit._snippetResult?.description && (
                    <p className="text-sm">
                        <Snippet
                            attribute="description"
                            hit={hit}
                            classNames={{
                                highlighted: "fern-search-hit-highlighted",
                                nonHighlighted: "fern-search-hit-non-highlighted",
                            }}
                        />
                    </p>
                )}
                {hit._snippetResult?.content && (
                    <p className="text-sm">
                        <Snippet
                            attribute="content"
                            hit={hit}
                            classNames={{
                                highlighted: "fern-search-hit-highlighted",
                                nonHighlighted: "fern-search-hit-non-highlighted",
                            }}
                        />
                    </p>
                )}
            </TooltipContent>
        </TooltipPortal>
    </Tooltip>
));

MemoizedTooltip.displayName = "MemoizedTooltip";
