import {
  AlgoliaIndexerTaskResponse,
  SEARCH_INDEX,
  algoliaIndexSettingsTask,
  algoliaIndexerTask,
} from "@fern-docs/search-server/algolia";
import {
  algoliaAppId,
  algoliaWriteApiKey,
  fdrEnvironment,
  fernToken_admin,
} from "./env-variables";

export const runReindexAlgolia = async (
  domain: string
): Promise<AlgoliaIndexerTaskResponse> => {
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
    fernToken: fernToken_admin(),
    domain,
  });

  console.timeEnd("reindexing");

  return response;
};
