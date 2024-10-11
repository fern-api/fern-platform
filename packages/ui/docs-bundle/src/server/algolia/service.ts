import algolia from "algoliasearch";
import { once } from "../once";

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

export const provideAlgoliaClient = once(() => {
    return algolia(algoliaAppId(), algoliaApiKey());
});
