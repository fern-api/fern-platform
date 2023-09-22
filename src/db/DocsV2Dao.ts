import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { DocsV1Db } from "../api";
import { DocsRegistrationInfo } from "../controllers/docs/v2/getDocsWriteV2Service";
import type { IndexSegment } from "../services/algolia";
import { WithoutQuestionMarks, readBuffer, writeBuffer } from "../util";
import { IndexSegmentIds, ReferencedAPIDefinitionIds } from "./types";

export interface StoreDocsDefinitionResponse {
    previousAlogliaIndex?: string;
    docsDefinitionId: string;
}

export interface LoadDocsDefinitionByUrlResponse {
    orgId: string;
    apiId: string;
    domain: string;
    path: string;
    algoliaIndex: string | undefined;
    docsDefinition: DocsV1Db.DocsDefinitionDb;
    indexSegmentIds: string[];
    docsConfigInstanceId: string | null;
}

export interface LoadDocsConfigResponse {
    docsConfig: DocsV1Db.DocsDbConfig;
    referencedApis: string[];
}

export interface DocsV2Dao {
    loadDocsForURL(url: URL): Promise<LoadDocsDefinitionByUrlResponse | undefined>;

    loadDocsConfigByInstanceId(docsConfigInstanceId: string): Promise<LoadDocsConfigResponse | undefined>;

    storeDocsDefinition({
        docsRegistrationInfo,
        dbDocsDefinition,
        indexSegments,
    }: {
        docsRegistrationInfo: DocsRegistrationInfo;
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb.V2;
        indexSegments: IndexSegment[];
    }): Promise<StoreDocsDefinitionResponse>;
}

type PrismaTransaction = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">;

export class DocsV2DaoImpl implements DocsV2Dao {
    constructor(private readonly prisma: PrismaClient) {}

    public async loadDocsForURL(url: URL): Promise<WithoutQuestionMarks<LoadDocsDefinitionByUrlResponse> | undefined> {
        const possibleDocs = await this.prisma.docsV2.findMany({
            where: {
                domain: url.hostname,
            },
            orderBy: {
                updatedTime: "desc",
            },
        });
        const docsDomain = possibleDocs.find((registeredDocs) => {
            return url.pathname.startsWith(registeredDocs.path);
        });
        if (docsDomain == null) {
            return undefined;
        }
        return {
            algoliaIndex: docsDomain.algoliaIndex ?? undefined,
            apiId: docsDomain.apiName,
            orgId: docsDomain.orgID,
            docsDefinition: migrateDocsDbDefinition(readBuffer(docsDomain.docsDefinition)),
            docsConfigInstanceId: docsDomain.docsConfigInstanceId,
            indexSegmentIds: docsDomain.indexSegmentIds as IndexSegmentIds,
            path: docsDomain.path,
            domain: docsDomain.domain,
        };
    }

    public async loadDocsConfigByInstanceId(docsConfigInstanceId: string): Promise<LoadDocsConfigResponse | undefined> {
        const instance = await this.prisma.docsConfigInstances.findFirst({
            where: {
                docsConfigInstanceId: docsConfigInstanceId,
            },
        });
        if (instance == null) {
            return undefined;
        }
        return {
            docsConfig: readBuffer(instance.docsConfig) as DocsV1Db.DocsDbConfig,
            referencedApis: instance.referencedApiDefinitionIds as ReferencedAPIDefinitionIds,
        };
    }

    public async storeDocsDefinition({
        docsRegistrationInfo,
        dbDocsDefinition,
        indexSegments,
    }: {
        docsRegistrationInfo: DocsRegistrationInfo;
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb.V2;
        indexSegments: IndexSegment[];
    }): Promise<StoreDocsDefinitionResponse> {
        return await this.prisma.$transaction(async (tx) => {
            const bufferDocsDefinition = writeBuffer(dbDocsDefinition);

            // Step 1: Load Previous Docs
            const previousDocs = await tx.docsV2.findFirst({
                where: {
                    domain: docsRegistrationInfo.fernDomain,
                    path: "",
                },
            });

            // Step 2: Create new index segments associated with docs
            const indexSegmentIds = indexSegments.map((s) => s.id);

            await tx.indexSegment.createMany({
                data: indexSegments.map((seg) => ({
                    id: seg.id,
                    version: seg.type === "versioned" ? seg.version.id : null,
                })),
            });

            // Step 3: Store Docs Config Instance
            const instanceId = generateDocsDefinitionInstanceId();
            await tx.docsConfigInstances.create({
                data: {
                    docsConfig: writeBuffer(dbDocsDefinition.config),
                    docsConfigInstanceId: instanceId,
                    referencedApiDefinitionIds: dbDocsDefinition.referencedApis,
                },
            });

            // Step 4: Upsert the fern docs domain url with the docs definition + algolia index
            await createOrUpdateDocsDefinition({
                tx,
                instanceId,
                domain: docsRegistrationInfo.fernDomain,
                path: "",
                apiId: docsRegistrationInfo.apiId,
                orgId: docsRegistrationInfo.orgId,
                bufferDocsDefinition,
                indexSegmentIds,
            });

            // Step 5: Upsert custom domains with the docs definition + algolia index
            for (const customDomain of docsRegistrationInfo.customDomains) {
                await createOrUpdateDocsDefinition({
                    tx,
                    instanceId,
                    domain: customDomain.hostname,
                    path: customDomain.path,
                    apiId: docsRegistrationInfo.apiId,
                    orgId: docsRegistrationInfo.orgId,
                    bufferDocsDefinition,
                    indexSegmentIds,
                });
            }

            return {
                algoliaIndex: previousDocs?.algoliaIndex,
                docsDefinitionId: instanceId,
            };
        });
    }
}

function generateDocsDefinitionInstanceId(): string {
    return "docs_definition_" + uuidv4();
}

async function createOrUpdateDocsDefinition({
    tx,
    instanceId,
    bufferDocsDefinition,
    domain,
    path,
    apiId,
    orgId,
    indexSegmentIds,
}: {
    tx: PrismaTransaction;
    instanceId: string;
    bufferDocsDefinition: Buffer;
    domain: string;
    path: string;
    apiId: string;
    orgId: string;
    indexSegmentIds: IndexSegmentIds;
}): Promise<void> {
    await tx.docsV2.upsert({
        where: {
            domain_path: {
                domain,
                path,
            },
        },
        create: {
            docsDefinition: bufferDocsDefinition,
            domain,
            path,
            apiName: apiId,
            orgID: orgId,
            docsConfigInstanceId: instanceId,
            algoliaIndex: null,
        },
        update: {
            docsDefinition: bufferDocsDefinition,
            apiName: apiId,
            orgID: orgId,
            docsConfigInstanceId: instanceId,
            indexSegmentIds,
        },
    });
}

function migrateDocsDbDefinition(dbValue: unknown): DocsV1Db.DocsDefinitionDb {
    return {
        // default to v1, but this will be overwritten if dbValue has "type" defined
        type: "v1",
        ...(dbValue as object),
    } as DocsV1Db.DocsDefinitionDb;
}
