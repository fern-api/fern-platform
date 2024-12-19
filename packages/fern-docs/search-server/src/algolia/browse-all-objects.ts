import { type Algoliasearch, type BrowseResponse } from "algoliasearch";

export async function browseAllObjectsForDomain(
    algolia: Algoliasearch,
    domain: string,
    indexName: string,
    attributesToRetrieve?: string[]
): Promise<Record<string, any>[]> {
    return browseAllObjectsForFilters(
        algolia,
        `domain:${domain}`,
        indexName,
        attributesToRetrieve,
        false
    );
}

export async function browseAllObjectsForFilters(
    algolia: Algoliasearch,
    filters: string,
    indexName: string,
    attributesToRetrieve?: string[],
    distinct?: boolean
): Promise<Record<string, any>[]> {
    let response: BrowseResponse;
    let cursor: string | undefined;
    const hits: Record<string, any>[] = [];
    do {
        response = await algolia.browse({
            browseParams: {
                filters,
                hitsPerPage: 1000,
                cursor,
                attributesToRetrieve,
                distinct,
            },
            indexName,
        });
        cursor = response.cursor;
        hits.push(...response.hits);
    } while (cursor != null);
    return hits;
}
