import { type Algoliasearch } from "algoliasearch";
import { createSearchFilters } from "./roles/create-search-filters.js";

interface GetSearchApiKeyOptions {
    /**
     * Algolia search client
     */
    client: Algoliasearch;

    /**
     * Parent READ-only API key scoped to the search index.
     */
    parentApiKey: string;

    /**
     * This should be "fern-docs-search"
     */
    searchIndex: string;

    /**
     * Domain of the docs instance, (i.e. buildwithfern.com, docs.cohere.com, etc.)
     */
    domain: string;

    /**
     * Roles of the user
     */
    roles: string[];

    /**
     * Whether the user is authed or anonymous
     */
    authed: boolean;

    /**
     * Number of seconds from now until the key expires
     */
    expiresInSeconds: number;
}

export async function getSearchApiKey({
    client,
    parentApiKey,
    domain,
    roles,
    authed,
    expiresInSeconds,
    searchIndex,
}: GetSearchApiKeyOptions): Promise<string | undefined> {
    return client.generateSecuredApiKey({
        parentApiKey,
        restrictions: {
            filters: createSearchFilters({ domain, roles, authed }),
            validUntil: Math.floor(Date.now() / 1_000) + expiresInSeconds,
            restrictIndices: [searchIndex],
        },
    });
}
