import { AuthType } from "@prisma/client";
import NodeCache from "node-cache";
import { DocsV1Db, DocsV1Read, DocsV2Read, FdrAPI } from "../../api";
import { FdrApplication } from "../../app";
import { getDocsDefinition, getDocsForDomain } from "../../controllers/docs/v1/getDocsReadService";
import { DocsRegistrationInfo } from "../../controllers/docs/v2/getDocsWriteV2Service";
import { FdrDao } from "../../db";
import type { IndexSegment } from "../../services/algolia";

const DOCS_DOMAIN_REGX = /^([^.\s]+)/;

export interface DocsDefinitionCache {
    getDocsForUrl(request: { url: URL; authorization?: string }): Promise<DocsV2Read.LoadDocsForUrlResponse>;

    getOrganizationForUrl(url: URL): Promise<FdrAPI.OrgId | undefined>;

    storeDocsForUrl({
        docsRegistrationInfo,
        dbDocsDefinition,
        indexSegments,
    }: {
        docsRegistrationInfo: DocsRegistrationInfo;
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb.V3;
        indexSegments: IndexSegment[];
    }): Promise<void>;
}

interface CachedDocsResponse {
    updatedTime: Date;
    response: DocsV2Read.LoadDocsForUrlResponse;
    dbFiles: Record<DocsV1Read.FileId, DocsV1Db.DbFileInfo>;
    isPrivate: boolean;
}

const TTL = 60 * 60 * 24; // 24 hours

const DOCS_CACHE = new NodeCache({
    stdTTL: TTL,
    maxKeys: 100,
});

export class DocsDefinitionCacheImpl implements DocsDefinitionCache {
    constructor(
        private readonly app: FdrApplication,
        private readonly dao: FdrDao,
    ) {}

    public async getDocsForUrl({
        url,
        authorization,
    }: {
        url: URL;
        authorization: string | undefined;
    }): Promise<DocsV2Read.LoadDocsForUrlResponse> {
        const cachedResponse = this.getDocsForUrlFromCache({ url });
        if (cachedResponse != null) {
            this.app.logger.info(`Cache HIT for ${url}`);
            if (cachedResponse.isPrivate) {
                await this.checkUserBelongsToOrg(url, authorization);
            }
            const updatedFileEntries = await Promise.all(
                Object.entries(cachedResponse.dbFiles).map(async ([fileId, dbFileInfo]) => {
                    return [fileId, await this.app.services.s3.getPresignedDownloadUrl({ key: dbFileInfo.s3Key })];
                }),
            );

            // we always pull updated s3 URLs
            return {
                ...cachedResponse.response,
                definition: {
                    ...cachedResponse.response.definition,
                    files: Object.fromEntries(updatedFileEntries),
                },
            };
        }

        this.app.logger.info(`Cache MISS for ${url}`);
        const dbResponse = await this.getDocsForUrlFromDatabase({ url });
        this.cacheResponse({ url, cachedResponse: dbResponse });

        if (dbResponse.isPrivate) {
            await this.checkUserBelongsToOrg(url, authorization);
        }

        return dbResponse.response;
    }

    private async checkUserBelongsToOrg(url: URL, authorization: string | undefined): Promise<void> {
        if (authorization == null) {
            throw new FdrAPI.UnauthorizedError("Authorization header is required");
        }
        const orgId = await this.getOrganizationForUrl(url);
        if (orgId == null) {
            throw new FdrAPI.InternalError("Cannot find organization for URL");
        }
        await this.app.services.auth.checkUserBelongsToOrg({
            authHeader: authorization,
            orgId: orgId,
        });
    }

    public async getOrganizationForUrl(url: URL): Promise<FdrAPI.OrgId | undefined> {
        // TODO: cache this
        const dbDocs = await this.dao.docsV2().loadDocsForURL(url);

        return dbDocs?.orgId;
    }

    public async storeDocsForUrl({
        docsRegistrationInfo,
        dbDocsDefinition,
        indexSegments,
    }: {
        docsRegistrationInfo: DocsRegistrationInfo;
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb.V3;
        indexSegments: IndexSegment[];
    }): Promise<void> {
        await this.dao.docsV2().storeDocsDefinition({
            docsRegistrationInfo,
            dbDocsDefinition,
            indexSegments,
        });
        // cache fern URL
        const fernUrl = docsRegistrationInfo.fernUrl.toURL();
        const dbResponse = await this.getDocsForUrlFromDatabase({ url: fernUrl });
        this.cacheResponse({ url: fernUrl, cachedResponse: dbResponse });
        // cache custom URLs
        for (const customURL of docsRegistrationInfo.customUrls) {
            const dbResponse = await this.getDocsForUrlFromDatabase({ url: customURL.toURL() });
            this.cacheResponse({ url: customURL.toURL(), cachedResponse: dbResponse });
        }
    }

    private cacheResponse({ url, cachedResponse }: { url: URL; cachedResponse: CachedDocsResponse }): void {
        DOCS_CACHE.set(url.hostname, cachedResponse, TTL);
    }

    private getDocsForUrlFromCache({ url }: { url: URL }): CachedDocsResponse | undefined {
        return DOCS_CACHE.get(url.hostname);
    }

    private async getDocsForUrlFromDatabase({ url }: { url: URL }): Promise<CachedDocsResponse> {
        const dbDocs = await this.dao.docsV2().loadDocsForURL(url);
        if (dbDocs != null) {
            const definition = await getDocsDefinition({
                app: this.app,
                docsDbDefinition: dbDocs.docsDefinition,
                docsV2: dbDocs,
            });
            return {
                updatedTime: dbDocs.updatedTime,
                dbFiles: dbDocs.docsDefinition.files,
                response: {
                    baseUrl: {
                        domain: dbDocs.domain,
                        basePath: dbDocs.path.trim() === "" ? undefined : dbDocs.path.trim(),
                    },
                    definition,
                    lightModeEnabled: definition.config.colorsV3?.type !== "dark",
                },
                isPrivate: dbDocs.authType !== AuthType.PUBLIC,
            };
        } else {
            // TODO(dsinghvi): Stop serving the v1 APIs
            // delegate to V1
            const v1Domain = url.hostname.match(DOCS_DOMAIN_REGX)?.[1];
            if (v1Domain == null) {
                throw new DocsV2Read.DomainNotRegisteredError();
            }
            const v1Docs = await getDocsForDomain({ app: this.app, domain: v1Domain });
            return {
                updatedTime: new Date(),
                dbFiles: v1Docs.dbFiles ?? {},
                response: {
                    baseUrl: {
                        domain: url.hostname,
                        basePath: undefined,
                    },
                    definition: v1Docs.response,
                    lightModeEnabled: v1Docs.response.config.colorsV3?.type !== "dark",
                },
                isPrivate: false,
            };
        }
    }
}
