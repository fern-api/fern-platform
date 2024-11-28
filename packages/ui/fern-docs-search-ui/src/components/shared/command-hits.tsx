import { TooltipPortal } from "@radix-ui/react-tooltip";
import { Command, useCommandState } from "cmdk";
import { ReactNode } from "react";
import { Snippet } from "react-instantsearch";
import { MarkRequired } from "ts-essentials";
import { PageIcon } from "../icons/page";
import { AlgoliaRecordHit } from "../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { HitContent } from "./hit-content";
import { generateHits } from "./hits";

export const CommandGroupSearchHits = ({
    items,
    onSelect,
}: {
    items: AlgoliaRecordHit[];
    onSelect: (path: string) => void;
}): ReactNode => {
    const value = useCommandState((state) => state.value);

    if (items.length === 0) {
        return false;
    }

    const groups = generateHits(items);

    return (
        <TooltipProvider>
            {groups.map((group, index) => (
                <Command.Group key={group.title ?? index} heading={group.title ?? "Results"} forceMount>
                    {group.hits.map((hit) => (
                        <Tooltip key={hit.path} open={value === hit.path}>
                            <TooltipTrigger asChild>
                                <Command.Item
                                    key={hit.path}
                                    value={hit.path}
                                    onSelect={() => onSelect(hit.path)}
                                    keywords={[hit.title]}
                                >
                                    <PageIcon
                                        icon={hit.icon}
                                        type={
                                            hit.record?.type === "api-reference"
                                                ? hit.record?.api_type
                                                : hit.record?.type
                                        }
                                        isSubPage={hit.record?.hash != null}
                                        className="self-start"
                                    />
                                    {hit.record != null && (
                                        <HitContent hit={hit.record as MarkRequired<AlgoliaRecordHit, "type">} />
                                    )}
                                    {hit.record == null && hit.title}
                                </Command.Item>
                            </TooltipTrigger>
                            {hit.record &&
                                (hit.record._snippetResult?.description || hit.record._snippetResult?.content) && (
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
                                            {hit.record._snippetResult?.description && (
                                                <p className="text-sm">
                                                    <Snippet
                                                        attribute="description"
                                                        hit={hit.record}
                                                        classNames={{
                                                            highlighted: "fern-search-hit-highlighted",
                                                            nonHighlighted: "fern-search-hit-non-highlighted",
                                                        }}
                                                    />
                                                </p>
                                            )}
                                            {hit.record._snippetResult?.content && (
                                                <p className="text-sm">
                                                    <Snippet
                                                        attribute="content"
                                                        hit={hit.record}
                                                        classNames={{
                                                            highlighted: "fern-search-hit-highlighted",
                                                            nonHighlighted: "fern-search-hit-non-highlighted",
                                                        }}
                                                    />
                                                </p>
                                            )}
                                        </TooltipContent>
                                    </TooltipPortal>
                                )}
                        </Tooltip>
                    ))}
                </Command.Group>
            ))}
        </TooltipProvider>
    );
};

CommandGroupSearchHits.displayName = "CommandGroupSearchHits";
