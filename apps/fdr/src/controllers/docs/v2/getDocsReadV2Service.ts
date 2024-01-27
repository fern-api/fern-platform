import { convertDbAPIDefinitionsToRead, convertDbDocsConfigToRead } from "@fern-api/fdr-sdk";
import NodeCache from "node-cache";
import { DocsV2Read, DocsV2ReadService } from "../../../api";
import type { FdrApplication } from "../../../app";
import { getParsedUrl } from "../../../util";

const SECONDS_IN_ONE_HOUR = 60 * 60;

const DOCS_CONFIG_ID_CACHE = new NodeCache({
    stdTTL: SECONDS_IN_ONE_HOUR,
    maxKeys: 100,
});

export function getDocsReadV2Service(app: FdrApplication): DocsV2ReadService {
    return new DocsV2ReadService({
        getDocsForUrl: async (req, res) => {
            const parsedUrl = getParsedUrl(req.body.url);
            const response = await app.docsDefinitionCache.getDocsForUrl({ url: parsedUrl });
            return res.send(response);
        },
        getPrivateDocsForUrl: async (req, res) => {
            const parsedUrl = getParsedUrl(req.body.url);
            const response = await app.docsDefinitionCache.getDocsForUrl({
                url: parsedUrl,
                authorization: req.headers.authorization,
            });
            return res.send(response);
        },
        getOrganizationForUrl: async (req, res) => {
            const parsedUrl = getParsedUrl(req.body.url);
            const orgId = await app.docsDefinitionCache.getOrganizationForUrl(parsedUrl);
            if (orgId == null) {
                throw new DocsV2Read.DomainNotRegisteredError();
            }
            return res.send(orgId);
        },
        getDocsConfigById: async (req, res) => {
            let docsConfig: DocsV2Read.GetDocsConfigByIdResponse | undefined =
                DOCS_CONFIG_ID_CACHE.get<DocsV2Read.GetDocsConfigByIdResponse>(req.params.docsConfigId);
            if (docsConfig == null) {
                const loadDocsConfigResponse = await app.dao
                    .docsV2()
                    .loadDocsConfigByInstanceId(req.params.docsConfigId);
                if (loadDocsConfigResponse == null) {
                    throw new DocsV2Read.DocsDefinitionNotFoundError();
                }
                const apiDefinitions = await app.dao.apis().loadAPIDefinitions(loadDocsConfigResponse.referencedApis);
                docsConfig = {
                    docsConfig: convertDbDocsConfigToRead({ dbShape: loadDocsConfigResponse.docsConfig }),
                    apis: convertDbAPIDefinitionsToRead(apiDefinitions),
                };
                DOCS_CONFIG_ID_CACHE.set(req.params.docsConfigId, {
                    docsConfig: convertDbDocsConfigToRead({ dbShape: loadDocsConfigResponse.docsConfig }),
                    apis: convertDbAPIDefinitionsToRead(apiDefinitions),
                });
            }
            return res.send(docsConfig);
        },
        getSearchApiKeyForIndexSegment: async (req, res) => {
            const { indexSegmentId } = req.body;
            const cachedKey = app.services.algoliaIndexSegmentManager.getSearchApiKeyForIndexSegment(indexSegmentId);
            if (cachedKey != null) {
                return res.send({ searchApiKey: cachedKey });
            }
            const indexSegment = await app.dao.indexSegment().loadIndexSegment(indexSegmentId);
            if (indexSegment == null) {
                throw new DocsV2Read.IndexSegmentNotFoundError();
            }
            const searchApiKey = app.services.algoliaIndexSegmentManager.generateAndCacheApiKey(indexSegmentId);
            return res.send({ searchApiKey });
        },
    });
}
