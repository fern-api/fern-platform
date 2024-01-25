import { AuthType } from "@prisma/client";
import { DocsV1Db, DocsV1Read, DocsV2Read, FdrAPI } from "../../api";
import { FdrApplication } from "../../app";
import { getDocsDefinition, getDocsForDomain } from "../../controllers/docs/v1/getDocsReadService";
import { DocsRegistrationInfo } from "../../controllers/docs/v2/getDocsWriteV2Service";
import { FdrDao } from "../../db";
import type { IndexSegment } from "../../services/algolia";

const DOCS_DOMAIN_REGX = /^([^.\s]+)/;

export interface DocsDefinitionCache {
    getDocsForUrl({ url }: { url: URL }): Promise<DocsV2Read.LoadDocsForUrlResponse>;

    storeDocsForUrl({
        docsRegistrationInfo,
        dbDocsDefinition,
        indexSegments,
    }: {
        docsRegistrationInfo: DocsRegistrationInfo;
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb.V2;
        indexSegments: IndexSegment[];
    }): Promise<void>;
}

/** The hostname without url scheme (e.g. docs.vellum.ai) */
type Hostnme = string;

/** The hostname without url scheme (e.g. docs.vellum.ai) */
type Path = string;

interface CachedDocsResponse {
    updatedTime: Date;
    response: DocsV2Read.LoadDocsForUrlResponse;
    dbFiles: Record<DocsV1Read.FileId, DocsV1Db.DbFileInfo>;
    isPrivate: boolean;
}

export class DocsDefinitionCacheImpl implements DocsDefinitionCache {
    private cache: Record<Hostnme, Record<Path, CachedDocsResponse>> = {};

    constructor(
        private readonly app: FdrApplication,
        private readonly dao: FdrDao,
    ) {}

    public async getDocsForUrl({ url }: { url: URL }): Promise<DocsV2Read.LoadDocsForUrlResponse> {
        const cachedResponse = this.getDocsForUrlFromCache({ url });
        if (cachedResponse != null) {
            if (cachedResponse.isPrivate) {
                throw new FdrAPI.UnauthorizedError("You must be authorized to view this documentation.");
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
        const dbResponse = await this.getDocsForUrlFromDatabase({ url });
        this.cacheResponse({ url, cachedResponse: dbResponse });

        if (dbResponse.isPrivate) {
            throw new FdrAPI.UnauthorizedError("You must be authorized to view this documentation.");
        }

        return dbResponse.response;
    }

    public async storeDocsForUrl({
        docsRegistrationInfo,
        dbDocsDefinition,
        indexSegments,
    }: {
        docsRegistrationInfo: DocsRegistrationInfo;
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb.V2;
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
        const cacheForHost = this.cache[url.hostname];
        if (cacheForHost == null) {
            this.cache[url.hostname] = { [url.pathname]: cachedResponse };
        } else {
            cacheForHost[url.pathname] = cachedResponse;
        }
    }

    private getDocsForUrlFromCache({ url }: { url: URL }): CachedDocsResponse | undefined {
        const responsesForHost = this.cache[url.hostname] ?? {};
        const cachedResponses = Object.entries(responsesForHost)
            .filter(([path]) => {
                return url.pathname.startsWith(path);
            })
            .sort(
                ([, cachedResponseA], [, cachedResponseB]) =>
                    cachedResponseB.updatedTime.getTime() - cachedResponseA.updatedTime.getTime(),
            )
            .map(([, cachedResponse]) => cachedResponse);
        return cachedResponses[0];
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
                        basePath: dbDocs.path === "" ? undefined : dbDocs.path,
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
