import { DocsV1Db, DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import { AuthType } from "@prisma/client";
import { DomainNotRegisteredError } from "../../api/generated/api/resources/docs/resources/v2/resources/read";
import { FdrApplication } from "../../app";
import { getDocsDefinition, getDocsForDomain } from "../../controllers/docs/v1/getDocsReadService";
import { DocsRegistrationInfo } from "../../controllers/docs/v2/getDocsWriteV2Service";
import { FdrDao } from "../../db";
import type { IndexSegment } from "../algolia";
import { Semaphore } from "../revalidator/Semaphore";
import LocalDocsDefinitionStore from "./LocalDocsDefinitionStore";
import RedisDocsDefinitionStore from "./RedisDocsDefinitionStore";

const DOCS_DOMAIN_REGX = /^([^.\s]+)/;

export interface DocsDefinitionCache {
    getDocsForUrl(request: { url: URL }): Promise<DocsV2Read.LoadDocsForUrlResponse>;

    storeDocsForUrl({
        docsRegistrationInfo,
        dbDocsDefinition,
        indexSegments,
    }: {
        docsRegistrationInfo: DocsRegistrationInfo;
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb.V3;
        indexSegments: IndexSegment[];
    }): Promise<void>;

    replaceDocsForInstanceId({
        instanceId,
        dbDocsDefinition,
        indexSegments,
    }: {
        instanceId: string;
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb.V3;
        indexSegments: IndexSegment[];
    }): Promise<void>;

    initialize(): Promise<void>;

    isInitialized(): boolean;

    invalidateCache(url: URL): Promise<void>;
}

/**
 * The semantic version that the current version of FDR expects.
 * Please bump this version if you would like to "clear" the cache.
 */
const SEMANTIC_VERSION = "v3";

/**
 * All modifications to this type must be forward compatible.
 * In other words, only add optional properties.
 */
export interface CachedDocsResponse {
    /** Adding a version to the cached response to allow for breaks in the future. */
    version: typeof SEMANTIC_VERSION;
    updatedTime: Date;
    response: DocsV2Read.LoadDocsForUrlResponse;
    dbFiles: Record<DocsV1Read.FileId, DocsV1Db.DbFileInfoV2>;
    isPrivate: boolean;
    usesPublicS3?: boolean;
}

export class DocsDefinitionCacheImpl implements DocsDefinitionCache {
    private localDocsCache: LocalDocsDefinitionStore;
    private redisDocsCache: RedisDocsDefinitionStore | undefined;
    private DOCS_WRITE_MONITOR: Record<string, Semaphore> = {};
    private initialized: boolean = false;

    constructor(
        private readonly app: FdrApplication,
        private readonly dao: FdrDao,
        localDocsCache: LocalDocsDefinitionStore,
        redisDocsCache: RedisDocsDefinitionStore | undefined,
    ) {
        this.localDocsCache = localDocsCache;
        this.redisDocsCache = redisDocsCache;
    }

    public isInitialized(): boolean {
        return this.initialized;
    }

    public async initialize(): Promise<void> {
        if (this.redisDocsCache) {
            await this.redisDocsCache.initializeCache();
        }
        this.initialized = true;
    }

    // allows us to block reads from writing to the cache while we are updating it
    private getDocsWriteMonitor(hostname: string): Semaphore {
        let monitor = this.DOCS_WRITE_MONITOR[hostname];
        if (monitor == null) {
            monitor = new Semaphore(1);
            this.DOCS_WRITE_MONITOR[hostname] = monitor;
        }
        return monitor;
    }

    public async invalidateCache(url: URL): Promise<void> {
        if (this.redisDocsCache) {
            await this.redisDocsCache.delete({ url });
        }
        this.localDocsCache.delete({ url });
    }

    public async getDocsForUrl({ url }: { url: URL }): Promise<DocsV2Read.LoadDocsForUrlResponse> {
        const cachedResponse = await this.getDocsForUrlFromCache({ url });
        if (cachedResponse != null) {
            this.app.logger.info(`Cache HIT for ${url}`);
            const filesV2: Record<string, DocsV1Read.File_> = Object.fromEntries(
                await Promise.all(
                    Object.entries(cachedResponse.dbFiles).map(async ([fileId, dbFileInfo]) => {
                        const presignedUrl = await this.app.services.s3.getPresignedDocsAssetsDownloadUrl({
                            key: dbFileInfo.s3Key,
                            isPrivate: cachedResponse.usesPublicS3 === true ? false : true,
                        });

                        switch (dbFileInfo.type) {
                            case "image": {
                                const { s3Key, ...image } = dbFileInfo;
                                return [fileId, { ...image, url: presignedUrl }];
                            }
                            default:
                                return [fileId, { type: "url", url: presignedUrl }];
                        }
                    }),
                ),
            );

            // we always pull updated s3 URLs
            return {
                ...cachedResponse.response,
                definition: {
                    ...cachedResponse.response.definition,
                    filesV2,
                },
            };
        }

        this.app.logger.info(`Cache MISS for ${url}`);
        const dbResponse = await this.getDocsForUrlFromDatabase({ url });

        // we don't want to cache from READ if we are currently updating the cache via WRITE
        if (!this.getDocsWriteMonitor(url.hostname).isLocked()) {
            await this.cacheResponse({ url, value: dbResponse });
        }

        return dbResponse.response;
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
        const resp = await this.dao.docsV2().storeDocsDefinition({
            docsRegistrationInfo,
            dbDocsDefinition,
            indexSegments,
        });

        // cache fern URL + custom URLs
        await Promise.all(
            resp.domains.map(async (docsUrl) => {
                // the write monitor is used to block reads from writing to the cache while we are updating it
                // it also prevents two cache-write operations to the same hostname from happening at the same time
                return await this.getDocsWriteMonitor(docsUrl.hostname).use(async () => {
                    const url = docsUrl.toURL();
                    const dbResponse = await this.getDocsForUrlFromDatabase({ url });
                    await this.cacheResponse({ url, value: dbResponse });
                });
            }),
        );
    }

    public async replaceDocsForInstanceId({
        instanceId,
        dbDocsDefinition,
        indexSegments,
    }: {
        instanceId: string;
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb.V3;
        indexSegments: IndexSegment[];
    }): Promise<void> {
        const resp = await this.dao.docsV2().replaceDocsDefinition({
            instanceId,
            dbDocsDefinition,
            indexSegments,
        });

        // cache fern URL + custom URLs
        await Promise.all(
            resp.domains.map(async (docsUrl) => {
                // the write monitor is used to block reads from writing to the cache while we are updating it
                // it also prevents two cache-write operations to the same hostname from happening at the same time
                return await this.getDocsWriteMonitor(docsUrl.hostname).use(async () => {
                    const url = docsUrl.toURL();
                    const dbResponse = await this.getDocsForUrlFromDatabase({ url });
                    await this.cacheResponse({ url, value: dbResponse });
                });
            }),
        );
    }

    private async cacheResponse({ url, value }: { url: URL; value: CachedDocsResponse }): Promise<void> {
        if (this.redisDocsCache) {
            await this.redisDocsCache.set({ url, value });
        }
        this.localDocsCache.set({ url, value });
    }

    private async getDocsForUrlFromCache({ url }: { url: URL }): Promise<CachedDocsResponse | null> {
        let record: CachedDocsResponse | null = null;
        if (this.redisDocsCache) {
            record = await this.redisDocsCache.get({ url });
        } else {
            record = this.localDocsCache.get({ url }) ?? null;
        }
        if (record != null && record.version !== SEMANTIC_VERSION) {
            return null;
        }
        return record;
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
                version: "v2",
                updatedTime: dbDocs.updatedTime,
                dbFiles: dbDocs.docsDefinition.files,
                response: {
                    orgId: dbDocs.orgId,
                    baseUrl: {
                        domain: dbDocs.domain,
                        basePath: dbDocs.path.trim() === "" ? undefined : dbDocs.path.trim(),
                    },
                    definition,
                    lightModeEnabled: definition.config.colorsV3?.type !== "dark",
                },
                isPrivate: dbDocs.authType !== AuthType.PUBLIC,
                usesPublicS3: dbDocs.hasPublicS3Assets,
            };
        } else {
            // TODO(dsinghvi): Stop serving the v1 APIs
            // delegate to V1
            const v1Domain = url.hostname.match(DOCS_DOMAIN_REGX)?.[1];
            if (v1Domain == null) {
                throw new DomainNotRegisteredError();
            }
            const v1Docs = await getDocsForDomain({ app: this.app, domain: v1Domain });
            return {
                version: "v2",
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
                usesPublicS3: false,
            };
        }
    }
}
