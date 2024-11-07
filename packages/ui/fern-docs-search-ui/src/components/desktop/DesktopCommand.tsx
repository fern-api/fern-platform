import { InitialResultsResponse } from "@/server/browse-results";
import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { Command } from "cmdk";
import { ReactElement, useDeferredValue } from "react";
import { useHits, useSearchBox } from "react-instantsearch";
import { MarkRequired } from "ts-essentials";
import { RegularCalendarIcon } from "../icons/RegularCalendarIcon";
import { RegularFileLinesIcon } from "../icons/RegularFileLinesIcon";
import { RemoteIcon } from "../icons/RemoteIcon";
import { HitContent } from "../shared/HitContent";
import { generateHits } from "../shared/hits";
import { AlgoliaRecordHit } from "../types";

const ICON_CLASS = "size-4 text-[#969696] dark:text-white/50 shrink-0 my-1";

export function DesktopCommand({
    initialResults,
    placeholder,
    onSubmit,
}: {
    initialResults: InitialResultsResponse;
    placeholder?: string;
    onSubmit: (path: string) => void;
}): ReactElement {
    const { query, refine } = useSearchBox();
    const { items: rawHits } = useHits<AlgoliaRecord>();

    const items = useDeferredValue(rawHits);
    const groups = generateHits(query.length > 0 ? items : [], query.length === 0 ? initialResults : undefined);

    return (
        <Command
            className="flex flex-col border border-[#DBDBDB] dark:border-white/10 rounded-lg overflow-hidden bg-[#F2F2F2]/30 dark:bg-[#1A1919]/30 backdrop-blur-xl"
            shouldFilter={false}
        >
            <Command.Input
                className="p-4 border-b last:border-b-0 border-[#DBDBDB] dark:border-white/10 w-full focus:outline-none bg-transparent text-lg placeholder:text-[#969696] dark:placeholder:text-white/50"
                autoFocus
                placeholder={placeholder ?? "Search"}
                onValueChange={refine}
            />
            <Command.Empty className="p-4 pb-6 text-center text-[#969696] dark:text-white/50">
                No results found
            </Command.Empty>
            <Command.List className="mb-3">
                {groups.map((group, index) => (
                    <Command.Group key={group.title ?? index} heading={group.title} className="mt-3">
                        {group.hits.map((hit) => (
                            <Command.Item
                                key={hit.path}
                                value={hit.path}
                                onSelect={() => onSubmit(hit.path)}
                                className="flex gap-2 cursor-default"
                            >
                                {hit.icon != null ? (
                                    <RemoteIcon icon={hit.icon} className={ICON_CLASS} />
                                ) : hit.record?.type === "changelog" ? (
                                    <RegularCalendarIcon className={ICON_CLASS} />
                                ) : (
                                    <RegularFileLinesIcon className={ICON_CLASS} />
                                )}
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
