import {
    APIV1Db,
    APIV1Read,
    Algolia,
    DocsV1Db,
    DocsV1Read,
    FdrAPI,
    convertDbAPIDefinitionToRead,
    convertDbDocsConfigToRead,
    migrateDocsDbDefinition,
    visitDbNavigationConfig,
} from "@fern-api/fdr-sdk";
import { AuthType, type IndexSegment } from "@prisma/client";
import { mapValues } from "lodash-es";
import { DocsV1ReadService } from "../../../api";
import { UnauthorizedError } from "../../../api/generated/api";
import { DomainNotRegisteredError } from "../../../api/generated/api/resources/docs/resources/v1/resources/read";
import type { FdrApplication } from "../../../app";
import { LoadDocsDefinitionByUrlResponse } from "../../../db";
import { readBuffer } from "../../../util";

export function getDocsReadService(app: FdrApplication): DocsV1ReadService {
    return new DocsV1ReadService({
        getDocsForDomainLegacy: async (req, res) => {
            const definition = await getDocsForDomain({ app, domain: req.params.domain });
            return res.send(definition.response);
        },
        getDocsForDomain: async (req, res) => {
            const definition = await getDocsForDomain({ app, domain: req.body.domain });
            return res.send(definition.response);
        },
    });
}

export async function getDocsForDomain({
    app,
    domain,
}: {
    app: FdrApplication;
    domain: string;
}): Promise<{ response: DocsV1Read.DocsDefinition; dbFiles?: Record<DocsV1Read.FileId, DocsV1Db.DbFileInfoV2> }> {
    const [docs, docsV2] = await Promise.all([
        app.services.db.prisma.docs.findFirst({
            where: {
                url: domain,
            },
        }),
        app.services.db.prisma.docsV2.findFirst({
            where: {
                domain,
            },
        }),
    ]);

    if (!docs) {
        throw new DomainNotRegisteredError();
    }
    const docsDefinitionJson = readBuffer(docs.docsDefinition);
    const docsDbDefinition = migrateDocsDbDefinition(docsDefinitionJson);

    if (docsV2 != null && docsV2.authType !== AuthType.PUBLIC) {
        throw new UnauthorizedError("You must be authorized to view this documentation.");
    }

    return {
        response: await getDocsDefinition({
            app,
            docsDbDefinition,
            docsV2:
                docsV2 != null
                    ? {
                          algoliaIndex:
                              docsV2.algoliaIndex != null
                                  ? FdrAPI.algolia.AlgoliaSearchIndex(docsV2.algoliaIndex)
                                  : undefined,
                          orgId: FdrAPI.OrgId(docsV2.orgID),
                          docsDefinition: migrateDocsDbDefinition(readBuffer(docsV2.docsDefinition)),
                          docsConfigInstanceId:
                              docsV2.docsConfigInstanceId != null
                                  ? FdrAPI.DocsConfigId(docsV2.docsConfigInstanceId)
                                  : null,
                          indexSegmentIds: docsV2.indexSegmentIds as string[],
                          path: docsV2.path,
                          domain: docsV2.domain,
                          updatedTime: docsV2.updatedTime,
                          authType: docsV2.authType,
                          hasPublicS3Assets: docsV2.hasPublicS3Assets,
                          isPreview: docsV2.isPreview,
                      }
                    : null,
        }),
        dbFiles: docsDbDefinition.files,
    };
}

export async function getDocsDefinition({
    app,
    docsDbDefinition,
    docsV2,
}: {
    app: FdrApplication;
    docsDbDefinition: DocsV1Db.DocsDefinitionDb;
    docsV2: LoadDocsDefinitionByUrlResponse | null;
}): Promise<DocsV1Read.DocsDefinition> {
    const [apiDefinitions, searchInfo] = await Promise.all([
        app.services.db.prisma.apiDefinitionsV2.findMany({
            where: {
                apiDefinitionId: {
                    in: Array.from(docsDbDefinition.referencedApis),
                },
            },
        }),
        loadIndexSegmentsAndGetSearchInfo({
            app,
            docsDbDefinition,
            docsV2,
        }),
    ]);

    const filesV2 = await getFilesV2(docsDbDefinition, app);

    return {
        algoliaSearchIndex: docsV2?.algoliaIndex ?? undefined,
        config: convertDbDocsConfigToRead({ dbShape: docsDbDefinition.config }),
        apis: Object.fromEntries(
            apiDefinitions.map((apiDefinition) => {
                const parsedApiDefinition = convertDbApiDefinitionToRead(apiDefinition.definition);
                return [apiDefinition.apiDefinitionId, parsedApiDefinition];
            }),
        ),
        files: mapValues(filesV2, (fileV2) => fileV2.url),
        jsFiles: docsDbDefinition.type === "v3" ? docsDbDefinition.jsFiles : undefined,
        filesV2,
        pages: docsDbDefinition.pages,
        search: searchInfo,
        id: docsV2?.docsConfigInstanceId ?? undefined,
    };
}

async function getFilesV2(docsDbDefinition: DocsV1Db.DocsDefinitionDb, app: FdrApplication) {
    let promisedFiles: Promise<[DocsV1Read.FileId, DocsV1Read.File_]>[];
    if (docsDbDefinition.type === "v3") {
        promisedFiles = Object.entries(docsDbDefinition.files).map(
            async ([fileId, fileDbInfo]): Promise<[DocsV1Read.FileId, DocsV1Read.File_]> => {
                const s3DownloadUrl = await app.services.s3.getPresignedDocsAssetsDownloadUrl({
                    key: fileDbInfo.s3Key,
                    isPrivate: true, // for backcompat
                });
                const readFile: DocsV1Read.File_ =
                    fileDbInfo.type === "image"
                        ? {
                              type: "image",
                              url: s3DownloadUrl,
                              width: fileDbInfo.width,
                              height: fileDbInfo.height,
                              blurDataUrl: fileDbInfo.blurDataUrl,
                              alt: fileDbInfo.alt,
                          }
                        : { type: "url", url: s3DownloadUrl };
                return [DocsV1Read.FileId(fileId), readFile];
            },
        );
    } else {
        promisedFiles = Object.entries(docsDbDefinition.files).map(
            async ([fileId, fileDbInfo]): Promise<[DocsV1Read.FileId, DocsV1Read.File_]> => {
                const s3DownloadUrl = await app.services.s3.getPresignedDocsAssetsDownloadUrl({
                    key: fileDbInfo.s3Key,
                    isPrivate: true, // for backcompat
                });
                return [DocsV1Read.FileId(fileId), { type: "url", url: s3DownloadUrl }];
            },
        );
    }
    return Object.fromEntries(await Promise.all(promisedFiles));
}

export async function loadIndexSegmentsAndGetSearchInfo({
    app,
    docsDbDefinition,
    docsV2,
}: {
    app: FdrApplication;
    docsDbDefinition: DocsV1Db.DocsDefinitionDb;
    docsV2: LoadDocsDefinitionByUrlResponse | null;
}): Promise<Algolia.SearchInfo> {
    const activeIndexSegments =
        docsV2?.indexSegmentIds != null
            ? await app.services.db.prisma.indexSegment.findMany({
                  where: { id: { in: docsV2.indexSegmentIds } },
              })
            : [];
    return getSearchInfoFromDocs({
        algoliaIndex: docsV2?.algoliaIndex,
        indexSegmentIds: docsV2?.indexSegmentIds,
        docsDbDefinition,
        activeIndexSegments,
        app,
    });
}

function getSearchInfoFromDocs({
    algoliaIndex,
    indexSegmentIds,
    activeIndexSegments,
    docsDbDefinition,
    app,
}: {
    algoliaIndex: string | undefined;
    indexSegmentIds: string[] | undefined;
    activeIndexSegments: IndexSegment[];
    docsDbDefinition: DocsV1Db.DocsDefinitionDb;
    app: FdrApplication;
}): Algolia.SearchInfo {
    if (indexSegmentIds == null || docsDbDefinition.config.navigation == null) {
        return { type: "legacyMultiAlgoliaIndex", algoliaIndex };
    }
    return visitDbNavigationConfig<Algolia.SearchInfo>(docsDbDefinition.config.navigation, {
        versioned: () => {
            const indexSegmentsByVersionId = activeIndexSegments.reduce<Record<string, Algolia.IndexSegment>>(
                (acc, indexSegment) => {
                    const searchApiKey =
                        app.services.algoliaIndexSegmentManager.getOrGenerateSearchApiKeyForIndexSegment(
                            indexSegment.id,
                        );
                    // Since the docs are versioned, all referenced index segments will have a version
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    acc[indexSegment.version!] = {
                        id: FdrAPI.IndexSegmentId(indexSegment.id),
                        searchApiKey,
                    };
                    return acc;
                },
                {},
            );
            return {
                type: "singleAlgoliaIndex",
                value: {
                    type: "versioned",
                    indexSegmentsByVersionId,
                },
            };
        },
        unversioned: () => {
            const indexSegment = activeIndexSegments[0];
            if (indexSegment == null) {
                /* preview docs do not have algolia index segments, and should return with an undefined index */
                return { type: "legacyMultiAlgoliaIndex", algoliaIndex: undefined };
            }
            const searchApiKey = app.services.algoliaIndexSegmentManager.getOrGenerateSearchApiKeyForIndexSegment(
                indexSegment.id,
            );

            return {
                type: "singleAlgoliaIndex",
                value: {
                    type: "unversioned",
                    indexSegment: {
                        id: FdrAPI.IndexSegmentId(indexSegment.id),
                        searchApiKey,
                    },
                },
            };
        },
    });
}

export function convertDbApiDefinitionToRead(buffer: Buffer): APIV1Read.ApiDefinition {
    const apiDefinitionJson = readBuffer(buffer) as APIV1Db.DbApiDefinition;
    return convertDbAPIDefinitionToRead(apiDefinitionJson);
}
