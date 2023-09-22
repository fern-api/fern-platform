import { DocsV2Read, DocsV2ReadService } from "../../../api";
import type { FdrApplication } from "../../../app";
import { convertApiDefinitionsToRead } from "../../../converters/read/convertAPIDefinitionToRead";
import { convertDbDocsConfigToRead } from "../../../converters/read/convertDocsConfigToRead";
import { getParsedUrl } from "../../../util";
import { getDocsDefinition, getDocsForDomain } from "../v1/getDocsReadService";

const DOCS_DOMAIN_REGX = /^([^.\s]+)/;

export function getDocsReadV2Service(app: FdrApplication): DocsV2ReadService {
    return new DocsV2ReadService({
        getDocsForUrl: async (req, res) => {
            const parsedUrl = getParsedUrl(req.body.url);
            const dbDocs = await app.dao.docsV2().loadDocsForURL(parsedUrl);
            if (dbDocs != null) {
                const definition = await getDocsDefinition({
                    app,
                    docsDbDefinition: dbDocs.docsDefinition,
                    docsV2: dbDocs,
                });
                return res.send({
                    baseUrl: {
                        domain: dbDocs.domain,
                        basePath: dbDocs.path === "" ? undefined : dbDocs.path,
                    },
                    definition,
                    lightModeEnabled: definition.config.colorsV3.type != "dark",
                });
            } else {
                // delegate to V1
                const v1Domain = parsedUrl.hostname.match(DOCS_DOMAIN_REGX)?.[1];
                if (v1Domain == null) {
                    throw new DocsV2Read.DomainNotRegisteredError();
                }
                const definition = await getDocsForDomain({ app, domain: v1Domain });
                return res.send({
                    baseUrl: {
                        domain: parsedUrl.hostname,
                        basePath: undefined,
                    },
                    definition,
                    lightModeEnabled: definition.config.colorsV3.type != "dark",
                });
            }
        },
        getDocsConfigById: async (req, res) => {
            const loadDocsConfigResponse = await app.dao.docsV2().loadDocsConfigByInstanceId(req.params.docsConfigId);
            if (loadDocsConfigResponse == null) {
                throw new DocsV2Read.DocsDefinitionNotFoundError();
            }
            const apiDefinitions = await app.dao.apis().loadAPIDefinitions(loadDocsConfigResponse.referencedApis);
            return res.send({
                docsConfig: convertDbDocsConfigToRead({ dbShape: loadDocsConfigResponse.docsConfig }),
                apis: convertApiDefinitionsToRead(apiDefinitions),
            });
        },
    });
}
