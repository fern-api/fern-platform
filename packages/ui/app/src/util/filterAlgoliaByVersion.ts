import { SearchRecord } from "@fern-ui/search-utils";

export function filterAlgoliaByVersion(hits: SearchRecord[], version: string | undefined): SearchRecord[] {
    if (!version) {
        return hits;
    }
    return hits.filter((hit) => (hit.slug as string).includes(version));
}
