import { SearchRecord } from "@fern-ui/search-utils";

export function deduplicateAlgoliaHits(hits: SearchRecord[]): SearchRecord[] {
    const seenTitles = new Set<string>();
    const deduplicatedHits: SearchRecord[] = [];

    for (const hit of hits) {
        const title = hit.title;
        const breadcrumbs = hit.breadcrumbs;
        if (typeof title === "string" && !seenTitles.has(title)) {
            seenTitles.add(title);
            deduplicatedHits.push(hit);
        }
    }

    return deduplicatedHits;
}
