import once from "@fern-api/ui-core-utils/once";
import { algoliasearch } from "algoliasearch";

function algoliaAppId(): string {
    const algoliaAppId = process.env.ALGOLIA_APP_ID;
    if (algoliaAppId == null) {
        throw new Error("ALGOLIA_APP_ID must be set");
    }
    return algoliaAppId;
}

export function algoliaApiKey(): string {
    const algoliaApiKey = process.env.ALGOLIA_API_KEY;
    if (algoliaApiKey == null) {
        throw new Error("ALGOLIA_API_KEY must be set");
    }
    return algoliaApiKey;
}

export function algoliaSearchIndex(): string {
    const algoliaSearchIndex = process.env.ALGOLIA_SEARCH_INDEX;
    if (algoliaSearchIndex == null) {
        throw new Error("ALGOLIA_SEARCH_INDEX must be set");
    }
    return algoliaSearchIndex;
}

export const provideAlgoliaClient = once(() => {
    return algoliasearch(algoliaAppId(), algoliaApiKey());
});
