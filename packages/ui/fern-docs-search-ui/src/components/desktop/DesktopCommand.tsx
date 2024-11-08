import { InitialResultsResponse } from "@/server/browse-results";
import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { Command } from "cmdk";
import { FileText, History, MessageCircle } from "lucide-react";
import { ReactElement, useDeferredValue } from "react";
import { useHits, useSearchBox } from "react-instantsearch";
import { MarkRequired } from "ts-essentials";
import { RemoteIcon } from "../icons/RemoteIcon";
import { HitContent } from "../shared/HitContent";
import { generateHits } from "../shared/hits";
import { AlgoliaRecordHit } from "../types";

const ICON_CLASS = "size-4 text-[#969696] dark:text-white/50 shrink-0 my-1";

export function DesktopCommand({
    initialResults,
    placeholder,
    onSubmit,
    onAskAI,
}: {
    initialResults: InitialResultsResponse;
    placeholder?: string;
    onSubmit: (path: string) => void;
    onAskAI?: () => void;
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
                <Command.Group className="mt-3">
                    <Command.Item value="ai-chat" className="flex gap-2 cursor-default" onSelect={() => onAskAI?.()}>
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

                {groups.map((group, index) => (
                    <Command.Group key={group.title ?? index} heading={group.title ?? "Results"} className="mt-3">
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
