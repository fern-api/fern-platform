import { DocsV1Db, DocsV1Read } from "../../client";
import { SearchInfo } from "../../client/FdrAPI";
import { FernRegistry } from "../../client/generated";
import { convertDbDocsConfigToRead } from "./convertDbDocsConfigToRead";

export function convertDocsDefinitionToRead({
    docsDbDefinition,
    algoliaSearchIndex,
    filesV2,
    apis,
    id,
    search,
}: {
    docsDbDefinition: DocsV1Db.DocsDefinitionDb.V3;
    algoliaSearchIndex: FernRegistry.AlgoliaSearchIndex | undefined;
    filesV2: Record<DocsV1Db.FileId, DocsV1Db.DbFileInfoV2>;
    apis: Record<DocsV1Db.ApiDefinitionId, FernRegistry.api.v1.db.DbApiDefinition>;
    id: DocsV1Db.DocsConfigId;
    search: SearchInfo;
}): DocsV1Read.DocsDefinition {
    return {
        algoliaSearchIndex,
        pages: docsDbDefinition.pages,
        apis: convertDbApisToRead(apis),
        files: convertDbFilesToRead(docsDbDefinition.files),
        filesV2: convertDbFilesV2ToRead(filesV2),
        jsFiles: docsDbDefinition.jsFiles,
        id,
        config: convertDbDocsConfigToRead({ dbShape: docsDbDefinition.config }),
        search,
    };
}
