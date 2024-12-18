import { AlgoliaRecordHit } from "../../types";

export interface GroupedHit {
    title: string;
    path: string;
    icon?: string;
    record?: AlgoliaRecordHit;
}

export interface GroupedHits {
    title?: string;
    hits: GroupedHit[];
}

export function generateHits(items: AlgoliaRecordHit[]): GroupedHits[] {
    return [
        {
            title: "Results",
            hits: items.map((hit) => ({
                title: hit.title,
                path: `${hit.pathname}${hit.hash ?? ""}`,
                icon: hit.icon,
                record: hit,
            })),
        },
    ];
}
