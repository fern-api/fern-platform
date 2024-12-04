import { AlgoliaRecordHit } from "../../types";

export interface GroupedHits {
    title?: string;
    hits: {
        title: string;
        path: string;
        // category: string;
        icon?: string;
        record?: AlgoliaRecordHit;
    }[];
}

// type SegmentType = "markdown" | "changelog" | "parameter" | "http" | "webhook" | "websocket";
// const SEGMENT_DISPLAY_NAMES: Record<SegmentType, string> = {
//     markdown: "Guides",
//     changelog: "Changelog",
//     parameter: "Parameters",
//     http: "Endpoints",
//     webhook: "Webhooks",
//     websocket: "WebSockets",
// };

export function generateHits(items: AlgoliaRecordHit[]): GroupedHits[] {
    // return Object.entries(
    //     groupBy(items, (item): SegmentType => {
    //         if (item.type === "api-reference") {
    //             return item.api_type;
    //         }
    //         return item.type;
    //     }),
    // ).map(([type, hits]) => ({
    //     title: SEGMENT_DISPLAY_NAMES[type as SegmentType] ?? type,
    //     hits: hits.map((hit) => ({
    //         title: hit.title,
    //         path: `${hit.pathname}${hit.hash ?? ""}`,
    //         icon: hit.icon,
    //         record: hit,
    //     })),
    // }));

    return [
        {
            title: "Results",
            hits: items.map((hit) => ({
                title: hit.title,
                path: `${hit.pathname}${hit.hash ?? ""}`,
                // category: SEGMENT_DISPLAY_NAMES[hit.type === "api-reference" ? hit.api_type : hit.type],
                icon: hit.icon,
                record: hit,
            })),
        },
    ];
}
