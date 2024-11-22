import { Command } from "cmdk";
import { ReactNode } from "react";
import { MarkRequired } from "ts-essentials";
import { PageIcon } from "../icons/page";
import { AlgoliaRecordHit } from "../types";
import { HitContent } from "./hit-content";
import { generateHits } from "./hits";

export const CommandGroupSearchHits = ({
    items,
    onSelect,
}: {
    items: AlgoliaRecordHit[];
    onSelect: (path: string) => void;
}): ReactNode => {
    if (items.length === 0) {
        return false;
    }

    const groups = generateHits(items);

    return (
        <>
            {groups.map((group, index) => (
                <Command.Group key={group.title ?? index} heading={group.title ?? "Results"} forceMount>
                    {group.hits.map((hit) => (
                        <Command.Item key={hit.path} value={hit.path} onSelect={() => onSelect(hit.path)}>
                            <PageIcon
                                icon={hit.icon}
                                type={hit.record?.type === "api-reference" ? hit.record?.api_type : hit.record?.type}
                                isSubPage={hit.record?.hash != null}
                            />
                            {hit.record != null && (
                                <HitContent hit={hit.record as MarkRequired<AlgoliaRecordHit, "type">} />
                            )}
                            {hit.record == null && hit.title}
                        </Command.Item>
                    ))}
                </Command.Group>
            ))}
        </>
    );
};

CommandGroupSearchHits.displayName = "CommandGroupSearchHits";
