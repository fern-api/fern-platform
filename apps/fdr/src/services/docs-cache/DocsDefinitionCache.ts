import { DocsV1Db, DocsV2Read } from "../../api";
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
            return cachedResponse.response;
        }
        const dbResponse = await this.getDocsForUrlFromDatabase({ url });
        this.cacheResponse({ url, cachedResponse: dbResponse });
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
                    cachedResponseA.updatedTime.getTime() - cachedResponseB.updatedTime.getTime(),
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
                response: {
                    baseUrl: {
                        domain: dbDocs.domain,
                        basePath: dbDocs.path === "" ? undefined : dbDocs.path,
                    },
                    definition,
                    lightModeEnabled: definition.config.colorsV3.type != "dark",
                },
            };
        } else {
            // TODO(dsinghvi): Stop serving the v1 APIs
            // delegate to V1
            const v1Domain = url.hostname.match(DOCS_DOMAIN_REGX)?.[1];
            if (v1Domain == null) {
                throw new DocsV2Read.DomainNotRegisteredError();
            }
            const definition = await getDocsForDomain({ app: this.app, domain: v1Domain });
            return {
                updatedTime: new Date(),
                response: {
                    baseUrl: {
                        domain: url.hostname,
                        basePath: undefined,
                    },
                    definition,
                    lightModeEnabled: definition.config.colorsV3.type != "dark",
                },
            };
        }
    }
}
