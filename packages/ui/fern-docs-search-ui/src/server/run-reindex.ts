import {
    AlgoliaIndexerTaskResponse,
    algoliaIndexSettingsTask,
    algoliaIndexerTask,
} from "@fern-ui/fern-docs-search-server/tasks";
import { algoliaAppId, algoliaWriteApiKey, fdrEnvironment, fernToken } from "./env-variables";

const INDEX_NAME = "fern-docs-search";

export const runReindex = async (domain: string): Promise<AlgoliaIndexerTaskResponse> => {
    // eslint-disable-next-line no-console
    console.time("reindexing");

    await algoliaIndexSettingsTask({
        appId: algoliaAppId(),
        writeApiKey: algoliaWriteApiKey(),
        indexName: INDEX_NAME,
    });

    const response = await algoliaIndexerTask({
        appId: algoliaAppId(),
        writeApiKey: algoliaWriteApiKey(),
        indexName: INDEX_NAME,
        environment: fdrEnvironment(),
        fernToken: fernToken(),
        domain,
        authed: false,
    });

    // eslint-disable-next-line no-console
    console.timeEnd("reindexing");

    return response;
};
