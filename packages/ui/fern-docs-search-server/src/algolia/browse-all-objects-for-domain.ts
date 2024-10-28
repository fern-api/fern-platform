import { type Algoliasearch, type BrowseResponse } from "algoliasearch";

export async function browseAllObjectsForDomain(
    algolia: Algoliasearch,
    domain: string,
    indexName: string,
): Promise<Record<string, any>[]> {
    let response: BrowseResponse;
    let cursor: string | undefined;
    const hits: Record<string, any>[] = [];
    do {
        response = await algolia.browse({
            browseParams: {
                filters: `domain:${domain}`,
                hitsPerPage: 1000,
                cursor,
            },
            indexName,
        });
        cursor = response.cursor;
        hits.push(...response.hits);
    } while (cursor != null);
    return hits;
}
