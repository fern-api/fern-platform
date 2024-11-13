import { liteClient as algoliasearch, SearchForFacets } from "algoliasearch/lite";
import { zip } from "es-toolkit/array";

export const FACET_NAMES = ["product.title", "version.title", "type", "api_type", "method", "status_code"] as const;

export type FacetsResponse = Record<(typeof FACET_NAMES)[number], { value: string; count: number }[]>;

export async function getFacets({
    appId,
    apiKey,
    filters,
}: {
    appId: string;
    apiKey: string;
    filters?: string;
}): Promise<FacetsResponse> {
    const requests = FACET_NAMES.map(
        (facet): SearchForFacets => ({
            indexName: "fern-docs-search",
            facet,
            type: "facet",
            filters,
        }),
    );
    const testing = await algoliasearch(appId, apiKey).searchForFacets({
        requests,
    });

    const response: FacetsResponse = {
        type: [],
        api_type: [],
        method: [],
        status_code: [],
        "product.title": [],
        "version.title": [],
    };

    zip(testing.results, FACET_NAMES).forEach(([{ facetHits }, attribute]) => {
        const filteredFacets = facetHits.filter((hit) => hit.count > 0);

        if (filteredFacets.length < 2) {
            return;
        }

        filteredFacets.forEach((hit) => {
            response[attribute].push({ value: hit.value, count: hit.count });
        });
    });

    return response;
}

interface FilterOption {
    facet: string;
    value: string;
}

export const FACET_DISPLAY_NAME_MAP: Record<string, Record<string, string>> = {
    method: {
        GET: "GET requests",
        POST: "POST requests",
        PUT: "PUT requests",
        PATCH: "PATCH requests",
        DELETE: "DELETE requests",
    },
    api_type: {
        http: "rest",
        webhook: "webhooks",
        websocket: "web sockets",
    },
    type: {
        markdown: "guides",
        changelog: "changelog",
        "api-reference": "endpoints",
    },
};

export function toFilterOptions(facets: FacetsResponse | undefined, query: string): FilterOption[] {
    if (facets == null) {
        return [];
    }

    query = query.trim().toLowerCase();

    const results: FilterOption[] = [];

    FACET_NAMES.forEach((facet) => {
        const values = facets[facet];
        values.forEach(({ value, count }) => {
            if (count === 0) {
                return;
            }

            const displayName = FACET_DISPLAY_NAME_MAP[facet]?.[value];

            if (value.toLowerCase().includes(query) || displayName?.toLowerCase().includes(query)) {
                results.push({ facet, value });
            }
        });
    });

    return results;
}
