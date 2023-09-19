import type { DocsV2, IndexSegment } from "@prisma/client";
import { DocsV1Db, DocsV1Read, DocsV1ReadService } from "../../../api";
import type { FdrApplication } from "../../../app";
import { transformDbDocsDefinitionToRead } from "../../../converters/read/convertDocsDefinitionToRead";
import { readBuffer } from "../../../util";
import { isVersionedNavigationConfig } from "../../../util/fern/db";
import { convertDbApiDefinitionToRead } from "../../api/getApiReadService";

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

    return getDocsDefinition({ app, docsDbDefinition, docsV2 });
}

export async function getDocsDefinition({
    app,
    docsDbDefinition,
    docsV2,
}: {
    app: FdrApplication;
    docsDbDefinition: DocsV1Db.DocsDefinitionDb;
    docsV2: DocsV2 | null;
}): Promise<DocsV1Read.DocsDefinition> {
    const [apiDefinitions, activeIndexSegments] = await Promise.all([
        app.services.db.prisma.apiDefinitionsV2.findMany({
            where: {
                apiDefinitionId: {
                    in: Array.from(docsDbDefinition.referencedApis),
                },
            },
        }),
        docsV2?.indexSegmentIds != null
            ? app.services.db.prisma.indexSegment.findMany({
                  where: { id: { in: docsV2.indexSegmentIds as string[] } },
              })
            : Promise.resolve<IndexSegment[]>([]),
    ]);

    const searchInfo = getSearchInfoFromDocs({ docsV2, docsDbDefinition, activeIndexSegments, app });

    return {
        algoliaSearchIndex: docsV2?.algoliaIndex ?? undefined,
        config: transformDbDocsDefinitionToRead({ dbShape: docsDbDefinition }),
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
    };
}

function getSearchInfoFromDocs({
    docsV2,
    activeIndexSegments,
    docsDbDefinition,
    app,
}: {
    docsV2: DocsV2 | null;
    activeIndexSegments: IndexSegment[];
    docsDbDefinition: DocsV1Db.DocsDefinitionDb;
    app: FdrApplication;
}): DocsV1Read.SearchInfo {
    if (docsV2 == null || !Array.isArray(docsV2.indexSegmentIds)) {
        return { type: "legacyMultiAlgoliaIndex", algoliaIndex: docsV2?.algoliaIndex ?? undefined };
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
