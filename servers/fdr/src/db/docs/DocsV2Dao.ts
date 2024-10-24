import { APIV1Db, Algolia, DocsV1Db, DocsV2Read, FdrAPI, migrateDocsDbDefinition } from "@fern-api/fdr-sdk";
import { AuthType, PrismaClient } from "@prisma/client";
import urljoin from "url-join";
import { v4 as uuidv4 } from "uuid";
import { DocsRegistrationInfo } from "../../controllers/docs/v2/getDocsWriteV2Service";
import type { IndexSegment } from "../../services/algolia";
import { WithoutQuestionMarks, readBuffer, writeBuffer } from "../../util";
import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";
import { IndexSegmentIds, PrismaTransaction, ReferencedAPIDefinitionIds } from "../types";

export interface StoreDocsDefinitionResponse {
    // previousAlogliaIndex?: string;
    docsDefinitionId: string;
    domains: ParsedBaseUrl[];
}

export interface LoadDocsDefinitionByUrlResponse {
    orgId: FdrAPI.OrgId;
    domain: string;
    path: string;
    algoliaIndex: Algolia.AlgoliaSearchIndex | undefined;
    docsDefinition: WithoutQuestionMarks<DocsV1Db.DocsDefinitionDb.V3>;
    indexSegmentIds: string[];
    docsConfigInstanceId: APIV1Db.DocsConfigId | null;
    updatedTime: Date;
    authType: AuthType;
    hasPublicS3Assets: boolean;
    isPreview: boolean;
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

    replaceDocsDefinition({
        instanceId,
        dbDocsDefinition,
        indexSegments,
    }: {
        instanceId: string;
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb.V3;
        indexSegments: IndexSegment[];
    }): Promise<StoreDocsDefinitionResponse>;

    listAllDocsUrls(opts: {
        limit?: number;
        page?: number;
        customOnly?: boolean;
        domainSuffix: string;
    }): Promise<DocsV2Read.ListAllDocsUrlsResponse>;

    transferDomainOwner({ domain, toOrgId }: { domain: string; toOrgId: string }): Promise<void>;
}

export class DocsV2DaoImpl implements DocsV2Dao {
    constructor(private readonly prisma: PrismaClient) {}

    public async transferDomainOwner({ domain, toOrgId }: { domain: string; toOrgId: string }): Promise<void> {
        await this.prisma.docsV2.updateMany({
            where: {
                domain,
            },
            data: {
                orgID: toOrgId,
            },
        });
    }

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
            algoliaIndex:
                docsDomain.algoliaIndex != null ? Algolia.AlgoliaSearchIndex(docsDomain.algoliaIndex) : undefined,
            orgId: FdrAPI.OrgId(docsDomain.orgID),
            docsDefinition: migrateDocsDbDefinition(readBuffer(docsDomain.docsDefinition)),
            docsConfigInstanceId:
                docsDomain.docsConfigInstanceId != null ? APIV1Db.DocsConfigId(docsDomain.docsConfigInstanceId) : null,
            indexSegmentIds: docsDomain.indexSegmentIds as IndexSegmentIds,
            path: docsDomain.path,
            domain: docsDomain.domain,
            updatedTime: docsDomain.updatedTime,
            authType: docsDomain.authType,
            hasPublicS3Assets: docsDomain.hasPublicS3Assets,
            isPreview: docsDomain.isPreview,
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

            // Step 1: Create new index segments associated with docs
            const indexSegmentIds = indexSegments.map((s) => s.id);
            await tx.indexSegment.createMany({
                data: indexSegments.map((seg) => ({
                    id: seg.id,
                    version: seg.type === "versioned" ? seg.version.id : null,
                })),
            });

            // Step 2: Store Docs Config Instance
            const instanceId = generateDocsDefinitionInstanceId();
            await tx.docsConfigInstances.create({
                data: {
                    docsConfig: writeBuffer(dbDocsDefinition.config),
                    docsConfigInstanceId: instanceId,
                    referencedApiDefinitionIds: dbDocsDefinition.referencedApis,
                },
            });

            // Step 3: Upsert the fern docs domain + custom domain url with the docs definition + algolia index
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
                docsDefinitionId: instanceId,
                domains: [docsRegistrationInfo.fernUrl, ...docsRegistrationInfo.customUrls],
            };
        });
    }

    public async listAllDocsUrls({
        limit = 1000,
        page = 1,
        customOnly = false,
        domainSuffix,
    }: {
        limit?: number;
        page?: number;
        customOnly?: boolean;
        domainSuffix: string;
    }): Promise<DocsV2Read.ListAllDocsUrlsResponse> {
        limit = Math.min(limit, 1000);
        const response = await this.prisma.docsV2.findMany({
            select: {
                orgID: true,
                domain: true,
                path: true,
                updatedTime: true,
            },
            where: {
                isPreview: false,
                authType: "PUBLIC",
                domain: customOnly ? { not: { endsWith: domainSuffix } } : undefined,
            },
            distinct: "domain",
            orderBy: {
                updatedTime: "desc",
            },
            take: limit,
            skip: Math.min(limit * (page - 1), 0),
        });

        return {
            urls: response.map(
                (r): DocsV2Read.DocsDomainItem => ({
                    domain: r.domain,
                    basePath: r.path.length > 1 ? r.path : undefined,
                    organizationId: FdrAPI.OrgId(r.orgID),
                    updatedAt: r.updatedTime.toISOString(),
                }),
            ),
        };
    }

    async replaceDocsDefinition({
        instanceId,
        dbDocsDefinition,
        indexSegments,
    }: {
        instanceId: string;
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb.V3;
        indexSegments: IndexSegment[];
    }): Promise<StoreDocsDefinitionResponse> {
        return this.prisma.$transaction(async (tx) => {
            const bufferDocsDefinition = writeBuffer(dbDocsDefinition);

            // Step 1: Load Previous Docs
            const previousDocs = await tx.docsV2.findMany({
                where: {
                    docsConfigInstanceId: instanceId,
                },
                select: {
                    domain: true,
                    path: true,
                    orgID: true,
                    isPreview: true,
                    authType: true,
                },
                orderBy: {
                    updatedTime: "desc",
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
            await tx.docsConfigInstances.update({
                where: {
                    docsConfigInstanceId: instanceId,
                },
                data: {
                    docsConfig: writeBuffer(dbDocsDefinition.config),
                    referencedApiDefinitionIds: dbDocsDefinition.referencedApis,
                },
            });

            // Step 4: Upsert the fern docs domain + custom domain url with the docs definition + algolia index
            await Promise.all(
                previousDocs.map((previousDoc) =>
                    createOrUpdateDocsDefinition({
                        tx,
                        instanceId,
                        domain: previousDoc.domain,
                        path: previousDoc.path,
                        orgId: previousDoc.orgID,
                        bufferDocsDefinition,
                        indexSegmentIds,
                        isPreview: previousDoc.isPreview,
                        authType: previousDoc.authType,
                    }),
                ),
            );

            return {
                docsDefinitionId: instanceId,
                domains: previousDocs.map((doc) => ParsedBaseUrl.parse(urljoin(doc.domain, doc.path))),
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
