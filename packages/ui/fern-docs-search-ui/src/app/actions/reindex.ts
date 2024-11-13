"use server";

import { algoliaAppId, algoliaWriteApiKey, fdrEnvironment, fernToken } from "@/server/env-variables";
import { algoliaIndexSettingsTask, algoliaIndexerTask } from "@fern-ui/fern-docs-search-server/tasks";

const INDEX_NAME = "fern-docs-search";

export const handleReindex = async (domain: string): Promise<void> => {
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
    // eslint-disable-next-line no-console
    console.debug(response);
};
