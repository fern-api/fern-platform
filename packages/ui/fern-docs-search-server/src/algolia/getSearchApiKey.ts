import { algoliaApiKey, algoliaSearchIndex, provideAlgoliaClient } from "./service.js";

export async function getSearchApiKey(indexSegmentId: string): Promise<string | undefined> {
    return provideAlgoliaClient().generateSecuredApiKey({
        parentApiKey: algoliaApiKey(),
        restrictions: {
            filters: `indexSegmentId:${indexSegmentId}`,
            validUntil: Math.floor(Date.now() / 1_000) + 60 * 60 * 24,
            restrictIndices: [algoliaSearchIndex()],
        },
    });
}
