import { SEARCH_INDEX } from "@fern-ui/fern-docs-search-server/algolia";
import {
    AlgoliaIndexerTaskResponse,
    algoliaIndexSettingsTask,
    algoliaIndexerTask,
} from "@fern-ui/fern-docs-search-server/tasks";
import { algoliaAppId, algoliaWriteApiKey, fdrEnvironment, fernToken } from "./env-variables";

export const runReindex = async (domain: string): Promise<AlgoliaIndexerTaskResponse> => {
    // eslint-disable-next-line no-console
    console.time("reindexing");

    await algoliaIndexSettingsTask({
        appId: algoliaAppId(),
        writeApiKey: algoliaWriteApiKey(),
        indexName: SEARCH_INDEX,
    });

    const response = await algoliaIndexerTask({
        appId: algoliaAppId(),
        writeApiKey: algoliaWriteApiKey(),
        indexName: SEARCH_INDEX,
        environment: fdrEnvironment(),
        fernToken: fernToken(),
        domain,
    });

    // eslint-disable-next-line no-console
    console.timeEnd("reindexing");

    return response;
};
