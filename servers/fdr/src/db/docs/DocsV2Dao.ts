import { migrateDocsDbDefinition } from "@fern-api/fdr-sdk";
import { AuthType, PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { DocsV1Db } from "../../api";
import { DocsRegistrationInfo } from "../../controllers/docs/v2/getDocsWriteV2Service";
import type { IndexSegment } from "../../services/algolia";
import { WithoutQuestionMarks, readBuffer, writeBuffer } from "../../util";
import { IndexSegmentIds, PrismaTransaction, ReferencedAPIDefinitionIds } from "../types";

export interface StoreDocsDefinitionResponse {
    previousAlogliaIndex?: string;
    docsDefinitionId: string;
}

export interface LoadDocsDefinitionByUrlResponse {
    orgId: string;
    domain: string;
    path: string;
    algoliaIndex: string | undefined;
    docsDefinition: DocsV1Db.DocsDefinitionDb.V3;
    indexSegmentIds: string[];
    docsConfigInstanceId: string | null;
    updatedTime: Date;
    authType: AuthType;
}

export interface LoadDocsConfigResponse {
    docsConfig: DocsV1Db.DocsDbConfig;
    referencedApis: string[];
}

export interface DocsV2Dao {
    checkDomainsDontBelongToAnotherOrg(domains: string[], orgId: string): Promise<boolean>;

    loadDocsForURL(url: URL): Promise<LoadDocsDefinitionByUrlResponse | undefined>;

    loadDocsConfigByInstanceId(docsConfigInstanceId: string): Promise<LoadDocsConfigResponse | undefined>;

    storeDocsDefinition({
        docsRegistrationInfo,
        dbDocsDefinition,
        indexSegments,
    }: {
        docsRegistrationInfo: DocsRegistrationInfo;
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb.V3;
        indexSegments: IndexSegment[];
    }): Promise<StoreDocsDefinitionResponse>;
}

export class DocsV2DaoImpl implements DocsV2Dao {
    constructor(private readonly prisma: PrismaClient) {}
    public async checkDomainsDontBelongToAnotherOrg(domains: string[], orgId: string): Promise<boolean> {
        const matchedDomains = await this.prisma.docsV2.findMany({
            select: {
                orgID: true,
            },
            where: {
                domain: {
                    in: domains,
                },
            },
            distinct: ["orgID", "domain"],
        });

        return matchedDomains.every((matchedDomain) => matchedDomain.orgID === orgId);
    }

    public async loadDocsForURL(url: URL): Promise<WithoutQuestionMarks<LoadDocsDefinitionByUrlResponse> | undefined> {
        const docsDomain = await this.prisma.docsV2.findFirst({
            where: {
                domain: url.hostname,
            },
            orderBy: {
                updatedTime: "desc", // first item is the latest
            },
        });
        if (docsDomain == null) {
            return undefined;
        }
        return {
            algoliaIndex: docsDomain.algoliaIndex ?? undefined,
            orgId: docsDomain.orgID,
            docsDefinition: migrateDocsDbDefinition(readBuffer(docsDomain.docsDefinition)),
            docsConfigInstanceId: docsDomain.docsConfigInstanceId,
            indexSegmentIds: docsDomain.indexSegmentIds as IndexSegmentIds,
            path: docsDomain.path,
            domain: docsDomain.domain,
            updatedTime: docsDomain.updatedTime,
            authType: docsDomain.authType,
        };
    }

    public async loadDocsConfigByInstanceId(docsConfigInstanceId: string): Promise<LoadDocsConfigResponse | undefined> {
        const instance = await this.prisma.docsConfigInstances.findFirst({
            where: {
                docsConfigInstanceId,
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
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb.V3;
        indexSegments: IndexSegment[];
    }): Promise<StoreDocsDefinitionResponse> {
        return await this.prisma.$transaction(async (tx) => {
            const bufferDocsDefinition = writeBuffer(dbDocsDefinition);

            // Step 1: Load Previous Docs
            const previousDocs = await tx.docsV2.findFirst({
                where: {
                    domain: docsRegistrationInfo.fernUrl.hostname,
                    path: docsRegistrationInfo.fernUrl.path,
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

            // Step 4: Upsert the fern docs domain + custom domain url with the docs definition + algolia index
            await Promise.all(
                [docsRegistrationInfo.fernUrl, ...docsRegistrationInfo.customUrls].map((url) =>
                    createOrUpdateDocsDefinition({
                        tx,
                        instanceId,
                        domain: url.hostname,
                        path: url.path ?? "",
                        orgId: docsRegistrationInfo.orgId,
                        bufferDocsDefinition,
                        indexSegmentIds,
                        isPreview: docsRegistrationInfo.isPreview,
                        authType: docsRegistrationInfo.authType,
                    }),
                ),
            );

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
    orgId,
    indexSegmentIds,
    isPreview,
    authType,
}: {
    tx: PrismaTransaction;
    instanceId: string;
    bufferDocsDefinition: Buffer;
    domain: string;
    path: string;
    orgId: string;
    indexSegmentIds: IndexSegmentIds;
    isPreview: boolean;
    authType: AuthType;
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
            orgID: orgId,
            docsConfigInstanceId: instanceId,
            algoliaIndex: null,
            isPreview,
            authType,
            hasPublicS3Assets: authType === "PUBLIC",
        },
        update: {
            docsDefinition: bufferDocsDefinition,
            orgID: orgId,
            docsConfigInstanceId: instanceId,
            indexSegmentIds,
            isPreview,
            authType,
            hasPublicS3Assets: authType === "PUBLIC",
        },
    });
}
