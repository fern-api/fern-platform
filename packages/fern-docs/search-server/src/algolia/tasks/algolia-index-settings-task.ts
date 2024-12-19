import { algoliasearch } from "algoliasearch";
import { assert } from "ts-essentials";
import { setIndexSettings } from "../set-index-settings";

interface AlgoliaIndexSettingsTaskOptions {
    indexName: string;
    appId: string;
    writeApiKey: string;
}

interface AlgoliaIndexSettingsTaskResult {
    taskID: number;
    updatedAt: string;
}

export async function algoliaIndexSettingsTask({
    indexName,
    appId,
    writeApiKey,
}: AlgoliaIndexSettingsTaskOptions): Promise<AlgoliaIndexSettingsTaskResult> {
    assert(!!appId, "appId is required");
    assert(!!writeApiKey, "writeApiKey is required");

    const algolia = algoliasearch(appId, writeApiKey);

    // TODO: add retry loop
    return setIndexSettings(algolia, indexName);
}
