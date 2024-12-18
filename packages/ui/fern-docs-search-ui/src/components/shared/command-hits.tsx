import { TooltipPortal } from "@radix-ui/react-tooltip";
import type { SendEventForHits } from "instantsearch.js/es/lib/utils";
import { PropsWithChildren, ReactNode, memo } from "react";
import { Snippet } from "react-instantsearch";

import { useSearchHits, useSendEvent } from "../../hooks/use-search-hits";
import { AlgoliaRecordHit } from "../../types";
import * as Command from "../cmdk";
import { PageIcon } from "../icons/page";
import { useFacetFilters } from "../search-client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { CommandLink } from "./command-link";
import { HitContent } from "./hit-content";
import { GroupedHit, generateHits } from "./hits";

export const CommandSearchHits = ({
    domain,
    onSelect,
    prefetch,
}: {
    domain: string;
    onSelect: (path: string) => void;
    prefetch?: (path: string) => Promise<void>;
}): ReactNode => {
    const isQueryEmpty = Command.useCommandState((state) => state.search.trimStart().length === 0) as boolean;
    const items = useSearchHits();
    const sendEvent = useSendEvent();

    const { filters } = useFacetFilters();

    if ((filters.length === 0 && isQueryEmpty) || items.length === 0) {
        return false;
    }

    return (
        <MemoizedCommandSearchHits
            items={items}
            sendEvent={sendEvent}
            onSelect={onSelect}
            prefetch={prefetch}
            domain={domain}
        />
    );
};

const MemoizedCommandSearchHits = memo(
    ({
        domain,
        items,
        sendEvent,
        onSelect,
        prefetch,
    }: {
        domain: string;
        items: AlgoliaRecordHit[];
        sendEvent: SendEventForHits;
        onSelect: (path: string) => void;
        prefetch?: (path: string) => Promise<void>;
    }) => {
        const groups = generateHits(items);

        return (
            <TooltipProvider>
                {groups.map((group, index) => (
                    <Command.Group key={group.title ?? index} heading={group.title ?? "Results"} forceMount>
                        {group.hits.map((hit, hitIndex) => (
                            <CommandHit
                                key={hit.path}
                                hit={hit}
                                onSelect={onSelect}
                                sendClickEvent={(eventName, additionalData) => {
                                    if (hit.record) {
                                        sendEvent("click", hit.record, eventName, {
                                            search_position: hitIndex + 1,
                                            ...additionalData,
                                        });
                                    }
                                }}
                                prefetch={prefetch}
                                domain={domain}
                            />
                        ))}
                    </Command.Group>
                ))}
            </TooltipProvider>
        );
    },
);

function CommandHit({
    hit,
    domain,
    onSelect,
    sendClickEvent,
    prefetch,
}: {
    hit: GroupedHit;
    domain: string;
    /**
     * @param path - the path to navigate to via nextjs router
     */
    onSelect: (path: string) => void;
    sendClickEvent?: (eventName?: string | undefined, additionalData?: Record<string, any> | undefined) => void;
    prefetch?: (path: string) => Promise<void>;
}) {
    if (!hit.record) {
        return false;
    }

    return (
        <CommandGroupSearchHitTooltip key={hit.path} hit={hit.record} path={hit.path}>
            <CommandLink
                href={hit.path}
                keywords={[hit.record.title]}
                prefetch={prefetch}
                onSelect={onSelect}
                domain={domain}
                sendClickEvent={sendClickEvent}
            >
                <PageIcon
                    icon={hit.icon}
                    type={hit.record.type === "api-reference" ? hit.record.api_type : hit.record.type}
                    isSubPage={hit.record.hash != null}
                    className="self-start"
                />
                <HitContent hit={hit.record} />
            </CommandLink>
        </CommandGroupSearchHitTooltip>
    );
}

MemoizedCommandSearchHits.displayName = "MemoizedCommandSearchHits";

function CommandGroupSearchHitTooltip({
    hit,
    path,
    children,
}: PropsWithChildren<{ hit: AlgoliaRecordHit; path: string }>) {
    const open = Command.useCommandState((state) => state.value === path) as boolean;

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
                className="max-w-[min(var(--radix-tooltip-content-available-width),384px)] max-h-[var(--radix-tooltip-content-available-height)] [&_mark]:bg-[var(--accent-a3)] [&_mark]:text-[var(--accent-a11)] space-y-2"
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
