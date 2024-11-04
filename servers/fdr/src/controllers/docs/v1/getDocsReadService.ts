import {
    APIV1Db,
    APIV1Read,
    Algolia,
    DocsV1Db,
    DocsV1Read,
    FdrAPI,
    FernNavigation,
    convertDbAPIDefinitionToRead,
    convertDocsDefinitionToRead,
    migrateDocsDbDefinition,
    visitDbNavigationConfig,
    CONTINUE,
    STOP,
} from "@fern-api/fdr-sdk";
import { AuthType, type IndexSegment } from "@prisma/client";
import { keyBy } from "es-toolkit";
import { mapValues } from "lodash-es";
import { DocsV1ReadService } from "../../../api";
import { UnauthorizedError } from "../../../api/generated/api";
import { DomainNotRegisteredError } from "../../../api/generated/api/resources/docs/resources/v1/resources/read";
import type { FdrApplication } from "../../../app";
import { LoadDocsDefinitionByUrlResponse } from "../../../db";
import { readBuffer } from "../../../util";
import { getFilesV2 } from "../../../util/getFilesV2";

export function getDocsReadService(app: FdrApplication): DocsV1ReadService {
    return new DocsV1ReadService({
        getDocsForDomainLegacy: async (req, res) => {
            // TODO: start deleting this deprecated endpoint
            await app.services.auth.checkUserBelongsToOrg({
                authHeader: req.headers.authorization,
                orgId: "fern",
            });
            const definition = await getDocsForDomain({ app, domain: req.params.domain });
            return res.send(definition.response);
        },
        getDocsForDomain: async (req, res) => {
            // TODO: start deleting this deprecated endpoint
            await app.services.auth.checkUserBelongsToOrg({
                authHeader: req.headers.authorization,
                orgId: "fern",
            });
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

    const bufferedApiDefinitionsById = keyBy(apiDefinitions, (def) => DocsV1Db.ApiDefinitionId(def.apiDefinitionId));

    const filesV2 = await getFilesV2(docsDbDefinition, app);

    const apiDefinitionsById = mapValues(bufferedApiDefinitionsById, (def) =>
        convertDbApiDefinitionToRead(def.definition),
    );

    return convertDocsDefinitionToRead({
        docsDbDefinition,
        algoliaSearchIndex: docsV2?.algoliaIndex ?? undefined,
        filesV2,
        apis: apiDefinitionsById,
        id: docsV2?.docsConfigInstanceId ?? undefined,
        search: searchInfo,
    });
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

function getVersionedSearchInfoFromDocs(activeIndexSegments: IndexSegment[], app: FdrApplication): Algolia.SearchInfo {
    const indexSegmentsByVersionId = activeIndexSegments.reduce<Record<string, Algolia.IndexSegment>>(
        (acc, indexSegment) => {
            const searchApiKey = app.services.algoliaIndexSegmentManager.getOrGenerateSearchApiKeyForIndexSegment(
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
}

function getUnversionedSearchInfoFromDocs(
    activeIndexSegments: IndexSegment[],
    app: FdrApplication,
): Algolia.SearchInfo {
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
}

export function getSearchInfoFromDocs({
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
    if (indexSegmentIds == null) {
        return { type: "legacyMultiAlgoliaIndex", algoliaIndex };
    }

    if (docsDbDefinition.config.navigation == null && docsDbDefinition.config.root == null) {
        return { type: "legacyMultiAlgoliaIndex", algoliaIndex };
    }

    if (docsDbDefinition.config.root != null) {
        const latestRoot = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(docsDbDefinition.config.root);
        let searchInfo: Algolia.SearchInfo | undefined;
        FernNavigation.traverseBF(latestRoot, (node) => {
            if (node.type === "versioned") {
                searchInfo = getVersionedSearchInfoFromDocs(activeIndexSegments, app);
                return STOP;
            } else if (node.type === "unversioned") {
                searchInfo = getUnversionedSearchInfoFromDocs(activeIndexSegments, app);
                return STOP;
            }
            return CONTINUE;
        });
        if (searchInfo != null) {
            return searchInfo;
        }
    } else if (docsDbDefinition.config.navigation != null) {
        return visitDbNavigationConfig<Algolia.SearchInfo>(docsDbDefinition.config.navigation, {
            versioned: () => {
                return getVersionedSearchInfoFromDocs(activeIndexSegments, app);
            },
            unversioned: () => {
                return getUnversionedSearchInfoFromDocs(activeIndexSegments, app);
            },
        });
    }

    return { type: "legacyMultiAlgoliaIndex", algoliaIndex };
}

export function convertDbApiDefinitionToRead(buffer: Buffer): APIV1Read.ApiDefinition {
    const apiDefinitionJson = readBuffer(buffer) as APIV1Db.DbApiDefinition;
    return convertDbAPIDefinitionToRead(apiDefinitionJson);
}
