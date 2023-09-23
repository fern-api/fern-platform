import type { IndexSegment } from "@prisma/client";
import { LoadDocsDefinitionByUrlResponse } from "../.../../../../db";
import { APIV1Db, APIV1Read, DocsV1Db, DocsV1Read, DocsV1ReadService } from "../../../api";
import type { FdrApplication } from "../../../app";
import { convertApiDefinitionToRead } from "../../../converters/read/convertAPIDefinitionToRead";
import { convertDbDocsConfigToRead } from "../../../converters/read/convertDocsConfigToRead";
import { readBuffer } from "../../../util";
import { isVersionedNavigationConfig } from "../../../util/fern/db";

export function getDocsReadService(app: FdrApplication): DocsV1ReadService {
    return new DocsV1ReadService({
        getDocsForDomainLegacy: async (req, res) => {
            const definition = await getDocsForDomain({ app, domain: req.params.domain });
            return res.send(definition);
        },
        getDocsForDomain: async (req, res) => {
            const definition = await getDocsForDomain({ app, domain: req.body.domain });
            return res.send(definition);
        },
    });
}

export async function getDocsForDomain({
    app,
    domain,
}: {
    app: FdrApplication;
    domain: string;
}): Promise<DocsV1Read.DocsDefinition> {
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
        throw new DocsV1Read.DomainNotRegisteredError();
    }
    const docsDefinitionJson = readBuffer(docs.docsDefinition);
    const docsDbDefinition = migrateDocsDbDefinition(docsDefinitionJson);

    return getDocsDefinition({
        app,
        docsDbDefinition,
        docsV2:
            docsV2 != null
                ? {
                      algoliaIndex: docsV2.algoliaIndex ?? undefined,
                      apiId: docsV2.apiName,
                      orgId: docsV2.orgID,
                      docsDefinition: migrateDocsDbDefinition(readBuffer(docsV2.docsDefinition)),
                      docsConfigInstanceId: docsV2.docsConfigInstanceId,
                      indexSegmentIds: docsV2.indexSegmentIds as string[],
                      path: docsV2.path,
                      domain: docsV2.domain,
                  }
                : null,
    });
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

    return {
        algoliaSearchIndex: docsV2?.algoliaIndex ?? undefined,
        config: convertDbDocsConfigToRead({ dbShape: docsDbDefinition.config }),
        apis: Object.fromEntries(
            apiDefinitions.map((apiDefinition) => {
                const parsedApiDefinition = convertDbApiDefinitionToRead(apiDefinition.definition);
                return [apiDefinition.apiDefinitionId, parsedApiDefinition];
            })
        ),
        files: Object.fromEntries(
            await Promise.all(
                Object.entries(docsDbDefinition.files).map(async ([fileId, fileDbInfo]) => {
                    const s3DownloadUrl = await app.services.s3.getPresignedDownloadUrl({ key: fileDbInfo.s3Key });
                    return [fileId, s3DownloadUrl];
                })
            )
        ),
        pages: docsDbDefinition.pages,
        search: searchInfo,
        id: docsV2?.docsConfigInstanceId ?? undefined,
    };
}

export async function loadIndexSegmentsAndGetSearchInfo({
    app,
    docsDbDefinition,
    docsV2,
}: {
    app: FdrApplication;
    docsDbDefinition: DocsV1Db.DocsDefinitionDb;
    docsV2: LoadDocsDefinitionByUrlResponse | null;
}): Promise<DocsV1Read.SearchInfo> {
    const activeIndexSegments =
        docsV2?.indexSegmentIds != null
            ? await app.services.db.prisma.indexSegment.findMany({
                  where: { id: { in: docsV2.indexSegmentIds as string[] } },
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
}): DocsV1Read.SearchInfo {
    if (indexSegmentIds == null) {
        return { type: "legacyMultiAlgoliaIndex", algoliaIndex };
    }
    const areDocsVersioned = isVersionedNavigationConfig(docsDbDefinition.config.navigation);
    if (areDocsVersioned) {
        const indexSegmentsByVersionId = activeIndexSegments.reduce<Record<string, DocsV1Read.IndexSegment>>(
            (acc, indexSegment) => {
                const searchApiKey = app.services.algoliaIndexSegmentManager.getOrGenerateSearchApiKeyForIndexSegment(
                    indexSegment.id
                );
                // Since the docs are versioned, all referenced index segments will have a version
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                acc[indexSegment.version!] = {
                    id: indexSegment.id,
                    searchApiKey,
                };
                return acc;
            },
            {}
        );
        return {
            type: "singleAlgoliaIndex",
            value: {
                type: "versioned",
                indexSegmentsByVersionId,
            },
        };
    } else {
        // If indexSegmentIds is an array, it must have at least 1 element
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const indexSegment = activeIndexSegments[0]!;
        const searchApiKey = app.services.algoliaIndexSegmentManager.getOrGenerateSearchApiKeyForIndexSegment(
            indexSegment.id
        );

        return {
            type: "singleAlgoliaIndex",
            value: {
                type: "unversioned",
                indexSegment: {
                    id: indexSegment.id,
                    searchApiKey,
                },
            },
        };
    }
}

export function migrateDocsDbDefinition(dbValue: unknown): DocsV1Db.DocsDefinitionDb {
    return {
        // default to v1, but this will be overwritten if dbValue has "type" defined
        type: "v1",
        ...(dbValue as object),
    } as DocsV1Db.DocsDefinitionDb;
}

export function convertDbApiDefinitionToRead(buffer: Buffer): APIV1Read.ApiDefinition {
    const apiDefinitionJson = readBuffer(buffer) as APIV1Db.DbApiDefinition;
    return convertApiDefinitionToRead(apiDefinitionJson);
}
