import { SearchRecord } from "@fern-ui/search-utils";

export function deduplicateAlgoliaHits(hits: SearchRecord[]): SearchRecord[] {
    const seen = new Set<string>();
    const deduplicatedHits: SearchRecord[] = [];

    for (const hit of hits) {
        const title = hit.title;
        const description = hit.content || hit.description;
        const cleanedDescription =
            typeof description === "string" ? description.replace(/<[^>]*>/g, "").trim() : undefined;

        if (typeof title === "string" && cleanedDescription && !seen.has(`${title}:${cleanedDescription}`)) {
            seen.add(`${title}:${cleanedDescription}`);
            deduplicatedHits.push(hit);
        }
    }

    return deduplicatedHits;
}
