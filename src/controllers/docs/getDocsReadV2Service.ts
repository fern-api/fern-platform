import type { FdrApplication } from "../../app";
import { DomainNotRegisteredError } from "../../generated/api/resources/docs/resources/v1/resources/read/errors/DomainNotRegisteredError";
import { ReadService as ReadV2Service } from "../../generated/api/resources/docs/resources/v2/resources/read/service/ReadService";
import { getParsedUrl, readBuffer } from "../../util";
import { getDocsDefinition, getDocsForDomain, migrateDocsDbDefinition } from "./getDocsReadService";

const DOCS_DOMAIN_REGX = /^([^.\s]+)/;

export function getDocsReadV2Service(app: FdrApplication): ReadV2Service {
    return new ReadV2Service({
        getDocsForUrl: async (req, res) => {
            try {
                const parsedUrl = getParsedUrl(req.body.url);
                const possibleDocs = await app.services.db.prisma.docsV2.findMany({
                    where: {
                        domain: parsedUrl.hostname,
                    },
                    orderBy: {
                        updatedTime: "desc",
                    },
                });
                const docsDomain = possibleDocs.find((registeredDocs) => {
                    return parsedUrl.pathname.startsWith(registeredDocs.path);
                });
                if (docsDomain != null) {
                    const docsDefinitionJson = readBuffer(docsDomain.docsDefinition);
                    const docsDbDefinition = migrateDocsDbDefinition(docsDefinitionJson);
                    const definition = await getDocsDefinition({ app, docsDbDefinition, docsV2: docsDomain });
                    return res.send({
                        baseUrl: {
                            domain: docsDomain.domain,
                            basePath: docsDomain.path === "" ? undefined : docsDomain.path,
                        },
                        definition,
                        lightModeEnabled: definition.config.colorsV3.type != "dark",
                    });
                } else {
                    // delegate to V1
                    const v1Domain = parsedUrl.hostname.match(DOCS_DOMAIN_REGX)?.[1];
                    if (v1Domain == null) {
                        throw new DomainNotRegisteredError();
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
            } catch (err) {
                app.logger.error(`Error while trying to fetch docs for ${req.body.url}`, err);
                await app.services.slack.notify(`Error while trying to fetch docs for ${req.body.url}`, err);
                throw err;
            }
        },
    });
}
