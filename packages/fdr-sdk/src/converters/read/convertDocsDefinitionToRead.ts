import { assertNever } from "@fern-api/ui-core-utils";
import { mapValues } from "es-toolkit";
import { DocsV1Db, DocsV1Read } from "../../client";
import { SearchInfo } from "../../client/FdrAPI";
import { FernRegistry } from "../../client/generated";
import { convertDbAPIDefinitionToRead } from "./convertDbAPIDefinitionToRead";
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

function convertDbApisToRead(
    apis: Record<DocsV1Db.ApiDefinitionId, FernRegistry.api.v1.db.DbApiDefinition>,
): Record<FernRegistry.ApiDefinitionId, FernRegistry.api.v1.read.ApiDefinition> {
    return mapValues(apis, (api) => convertDbAPIDefinitionToRead(api));
}

function convertDbFilesToRead(
    files: Record<DocsV1Db.FileId, DocsV1Db.DbFileInfoV2>,
): Record<FernRegistry.FileId, DocsV1Read.Url> {
    return mapValues(files, (file) => DocsV1Read.Url(file.s3Key));
}

function convertDbFilesV2ToRead(
    filesV2: Record<DocsV1Db.FileId, DocsV1Db.DbFileInfoV2>,
): Record<FernRegistry.FileId, FernRegistry.docs.v1.read.File_> {
    return mapValues(filesV2, (file) => {
        switch (file.type) {
            case "image":
                return {
                    type: "image",
                    url: DocsV1Read.Url(file.s3Key),
                    width: file.width,
                    height: file.height,
                    blurDataUrl: file.blurDataUrl,
                    alt: file.alt,
                };
            case "s3Key":
                return {
                    type: "url",
                    url: DocsV1Read.Url(file.s3Key),
                };
            default:
                assertNever(file);
        }
    });
}
