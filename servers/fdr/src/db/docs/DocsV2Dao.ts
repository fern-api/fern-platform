import { AuthType, PrismaClient } from "@prisma/client";
import urljoin from "url-join";
import { v4 as uuidv4 } from "uuid";

import {
  APIV1Db,
  Algolia,
  DocsV1Db,
  DocsV2Read,
  FdrAPI,
  migrateDocsDbDefinition,
} from "@fern-api/fdr-sdk";

import { DocsRegistrationInfo } from "../../controllers/docs/v2/getDocsWriteV2Service";
import type { IndexSegment } from "../../services/algolia";
import { WithoutQuestionMarks, readBuffer, writeBuffer } from "../../util";
import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";
import { sort } from "../../util/sort";
import {
  IndexSegmentIds,
  PrismaTransaction,
  ReferencedAPIDefinitionIds,
} from "../types";

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

export interface LoadDocsMetadata {
  orgId: FdrAPI.OrgId;
  domain: string;
  path: string;
  isPreview: boolean;
}

export interface LoadDocsConfigResponse {
  docsConfig: DocsV1Db.DocsDbConfig;
  referencedApis: string[];
}

export interface CheckDomainOwnershipResponse {
  allDomainsOwned: boolean;
  unownedDomains: string[];
}

export interface ListDocsSitesForOrgResponse {
  docsSites: DocsSite[];
}

export interface DocsSite {
  mainUrl: DocsSiteUrl;
  urls: DocsSiteUrl[];
}

export interface DocsSiteUrl {
  domain: string;
  path: string | undefined;
}

export interface DocsV2Dao {
  checkDomainsDontBelongToAnotherOrg(
    domains: string[],
    orgId: string
  ): Promise<CheckDomainOwnershipResponse>;

  loadDocsForURL(
    url: URL
  ): Promise<LoadDocsDefinitionByUrlResponse | undefined>;

  getOrgIdForDocsUrl(url: URL): Promise<FdrAPI.OrgId | undefined>;

  getOrgIdForDocsConfigInstanceId(
    docsConfigInstanceId: string
  ): Promise<FdrAPI.OrgId | undefined>;

  loadDocsConfigByInstanceId(
    docsConfigInstanceId: string
  ): Promise<LoadDocsConfigResponse | undefined>;

  loadDocsMetadata(url: URL): Promise<LoadDocsMetadata | undefined>;

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

  listDocsUrlsUpdatedWithin(opts: {
    days: number;
    limit?: number;
    page?: number;
  }): Promise<DocsV2Read.ListAllDocsUrlsResponse>;

  transferDomainOwner({
    domain,
    toOrgId,
  }: {
    domain: string;
    toOrgId: string;
  }): Promise<void>;

  listDocsSitesForOrg(orgID: string): Promise<ListDocsSitesForOrgResponse>;
}

export class DocsV2DaoImpl implements DocsV2Dao {
  constructor(private readonly prisma: PrismaClient) {}

  public async transferDomainOwner({
    domain,
    toOrgId,
  }: {
    domain: string;
    toOrgId: string;
  }): Promise<void> {
    await this.prisma.docsV2.updateMany({
      where: {
        domain,
      },
      data: {
        orgID: toOrgId,
      },
    });
  }

  public async checkDomainsDontBelongToAnotherOrg(
    domains: string[],
    orgId: string
  ): Promise<CheckDomainOwnershipResponse> {
    const matchedDomains = await this.prisma.docsV2.findMany({
      select: {
        orgID: true,
        domain: true,
      },
      where: {
        domain: {
          in: domains,
        },
      },
      distinct: ["orgID", "domain"],
    });

    const allDomainsOwned = matchedDomains.every(
      (matchedDomain) => matchedDomain.orgID === orgId
    );
    const unownedDomains = matchedDomains
      .filter((matchedDomain) => matchedDomain.orgID !== orgId)
      .map((matchedDomain) => matchedDomain.domain);
    return {
      allDomainsOwned,
      unownedDomains,
    };
  }

  public async loadDocsMetadata(
    url: URL
  ): Promise<LoadDocsMetadata | undefined> {
    const docsDomain = await this.prisma.docsV2.findFirst({
      where: {
        domain: url.hostname,
      },
      orderBy: {
        updatedTime: "desc",
      },
      select: {
        orgID: true,
        isPreview: true,
        domain: true,
        path: true,
      },
    });

    if (docsDomain == null) {
      return undefined;
    }

    return {
      orgId: FdrAPI.OrgId(docsDomain.orgID),
      domain: docsDomain.domain,
      path: docsDomain.path,
      isPreview: docsDomain.isPreview,
    };
  }

  public async loadDocsForURL(
    url: URL
  ): Promise<
    WithoutQuestionMarks<LoadDocsDefinitionByUrlResponse> | undefined
  > {
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
        docsDomain.algoliaIndex != null
          ? Algolia.AlgoliaSearchIndex(docsDomain.algoliaIndex)
          : undefined,
      orgId: FdrAPI.OrgId(docsDomain.orgID),
      docsDefinition: migrateDocsDbDefinition(
        readBuffer(docsDomain.docsDefinition)
      ),
      docsConfigInstanceId:
        docsDomain.docsConfigInstanceId != null
          ? APIV1Db.DocsConfigId(docsDomain.docsConfigInstanceId)
          : null,
      indexSegmentIds: docsDomain.indexSegmentIds as IndexSegmentIds,
      path: docsDomain.path,
      domain: docsDomain.domain,
      updatedTime: docsDomain.updatedTime,
      authType: docsDomain.authType,
      hasPublicS3Assets: docsDomain.hasPublicS3Assets,
      isPreview: docsDomain.isPreview,
    };
  }

  public async getOrgIdForDocsUrl(url: URL): Promise<FdrAPI.OrgId | undefined> {
    const docsDomain = await this.prisma.docsV2.findFirst({
      where: {
        domain: url.hostname,
      },
      select: {
        orgID: true,
      },
    });
    return docsDomain?.orgID != null
      ? FdrAPI.OrgId(docsDomain.orgID)
      : undefined;
  }

  public async getOrgIdForDocsConfigInstanceId(
    docsConfigInstanceId: string
  ): Promise<FdrAPI.OrgId | undefined> {
    const instance = await this.prisma.docsV2.findFirst({
      where: {
        docsConfigInstanceId,
      },
      select: {
        orgID: true,
      },
    });
    return instance?.orgID != null ? FdrAPI.OrgId(instance.orgID) : undefined;
  }

  public async loadDocsConfigByInstanceId(
    docsConfigInstanceId: string
  ): Promise<LoadDocsConfigResponse | undefined> {
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
      referencedApis:
        instance.referencedApiDefinitionIds as ReferencedAPIDefinitionIds,
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
    const bufferDocsDefinition = writeBuffer(dbDocsDefinition);

    // Step 1: Create new index segments associated with docs
    const indexSegmentIds = indexSegments.map((s) => s.id);
    await this.prisma.indexSegment.createMany({
      data: indexSegments.map((seg) => ({
        id: seg.id,
        version: seg.type === "versioned" ? seg.version.id : null,
      })),
    });

    // Step 2: Store Docs Config Instance
    const instanceId = generateDocsDefinitionInstanceId();
    await this.prisma.docsConfigInstances.create({
      data: {
        docsConfig: writeBuffer(dbDocsDefinition.config),
        docsConfigInstanceId: instanceId,
        referencedApiDefinitionIds: dbDocsDefinition.referencedApis,
      },
    });

    // Step 3: Upsert the fern docs domain + custom domain url with the docs definition + algolia index
    await Promise.all(
      [docsRegistrationInfo.fernUrl, ...docsRegistrationInfo.customUrls].map(
        (url) =>
          createOrUpdateDocsDefinition({
            tx: this.prisma,
            instanceId,
            domain: url.hostname,
            path: url.path ?? "",
            orgId: docsRegistrationInfo.orgId,
            bufferDocsDefinition,
            indexSegmentIds,
            isPreview: docsRegistrationInfo.isPreview,
            authType: docsRegistrationInfo.authType,
          })
      )
    );

    return {
      docsDefinitionId: instanceId,
      domains: [
        docsRegistrationInfo.fernUrl,
        ...docsRegistrationInfo.customUrls,
      ],
    };
  }

  public async listDocsUrlsUpdatedWithin({
    days,
    limit = 1000,
    page = 1,
  }: {
    days: number;
    limit?: number;
    page?: number;
  }): Promise<DocsV2Read.ListAllDocsUrlsResponse> {
    limit = Math.min(limit, 1000);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

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
        updatedTime: {
          gte: cutoffDate,
        },
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
        })
      ),
    };
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
        })
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
          })
        )
      );

      return {
        docsDefinitionId: instanceId,
        domains: previousDocs.map((doc) =>
          ParsedBaseUrl.parse(urljoin(doc.domain, doc.path))
        ),
      };
    });
  }

  async listDocsSitesForOrg(
    orgID: string
  ): Promise<ListDocsSitesForOrgResponse> {
    return this.prisma.$transaction(async (tx) => {
      const dbDocsSites = await tx.$queryRaw<
        { urls: { domain: string; path: string | null | undefined }[] }[]
      >`
        SELECT
              JSONB_AGG(
                JSONB_BUILD_OBJECT('domain', "domain", 'path', "path")
              ) AS "urls"
        FROM "DocsV2"
        WHERE "orgID" = ${orgID} AND "isPreview" = false
        GROUP BY "docsConfigInstanceId";
      `;

      const docsSites = dbDocsSites.map((docsSite): DocsSite => {
        const urls = docsSite.urls.map(
          (url): DocsSiteUrl => ({
            domain: url.domain,
            path: url.path ?? undefined,
          })
        );

        const sortedUrls = sort(urls, compareDocsSiteUrls);

        return {
          // sortedUrls is guaranteed to be non-empty since `domains` is a
          // groupBy aggegation (and each group in a sql groupBy has at least one row)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          mainUrl: sortedUrls[0]!,
          urls: sortedUrls,
        };
      });

      return {
        docsSites: sort(docsSites, (a, b) =>
          compareDocsSiteUrls(a.mainUrl, b.mainUrl)
        ),
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

function compareDocsSiteUrls(a: DocsSiteUrl, b: DocsSiteUrl) {
  const aIsFernUrl = a.domain.endsWith(".buildwithfern.com");
  const bIsFernUrl = b.domain.endsWith(".buildwithfern.com");
  if (aIsFernUrl && !bIsFernUrl) {
    return 1;
  }
  if (bIsFernUrl && !aIsFernUrl) {
    return -1;
  }

  if (a.domain === b.domain) {
    if (a.path === b.path) {
      return 0;
    }
    if (a.path == null) {
      return -1;
    }
    if (b.path == null) {
      return 1;
    }
    return a.path < b.path ? -1 : 1;
  }

  return a.domain < b.domain ? -1 : 1;
}
