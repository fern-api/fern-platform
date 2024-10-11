import { algoliaApiKey, provideAlgoliaClient } from "./service";

export function getSearchApiKey(indexSegmentId: string): string | undefined {
    return provideAlgoliaClient().generateSecuredApiKey(algoliaApiKey(), {
        filters: `indexSegmentId:${indexSegmentId}`,
        validUntil: Math.floor(Date.now() / 1_000) + 60 * 60 * 24,
    });
}
