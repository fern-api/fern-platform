import { v4 as uuidv4 } from "uuid";
import { APIV1Db, DocsV1Write, DocsV2Write, DocsV2WriteService, FdrAPI } from "../../../api";
import { type FdrApplication } from "../../../app";
import { transformWriteDocsDefinitionToDb } from "../../../converters/db/convertDocsDefinitionToDb";
import { convertApiDefinitionToRead } from "../../../converters/read/convertAPIDefinitionToRead";
import { convertDbDocsConfigToRead } from "../../../converters/read/convertDocsConfigToRead";
import { type S3FileInfo } from "../../../services/s3";
import { getParsedUrl } from "../../../util";
import { createObjectFromMap } from "../../../util/object";

const DOCS_REGISTRATIONS: Record<DocsV1Write.DocsRegistrationId, DocsRegistrationInfo> = {};

export interface DocsRegistrationInfo {
    fernDomain: string;
    customDomains: ParsedCustomDomain[];
    orgId: FdrAPI.OrgId;
    s3FileInfos: Record<DocsV1Write.FilePath, S3FileInfo>;
    isPreview: boolean;
}

function validateDocsDomain({ app, domain }: { app: FdrApplication; domain: string }): string {
    const parsedUrl = getParsedUrl(domain);
    if (parsedUrl.hostname.endsWith(app.config.domainSuffix)) {
        return parsedUrl.hostname;
    }
    throw new DocsV2Write.InvalidDomainError();
}

interface ParsedCustomDomain {
    hostname: string;
    path: string;
}

function validateCustomDomains({ customDomains }: { customDomains: string[] }): ParsedCustomDomain[] {
    for (let i = 0; i < customDomains.length; ++i) {
        const one = customDomains[i];
        for (let j = i + 1; j < customDomains.length; ++j) {
            const two = customDomains[j];
            if (one == null || two == null) {
                continue;
            }
            if (one.includes(two) || two.includes(one)) {
                throw new DocsV2Write.InvalidCustomDomainError();
            }
        }
    }

    const parsedDomains: ParsedCustomDomain[] = [];
    for (const customDomain of customDomains) {
        const parsedDomain = getParsedUrl(customDomain);
        parsedDomains.push({
            hostname: parsedDomain.hostname,
            path: parsedDomain.pathname,
        });
    }
    return parsedDomains;
}

export function getDocsWriteV2Service(app: FdrApplication): DocsV2WriteService {
    return new DocsV2WriteService({
        startDocsRegister: async (req, res) => {
            await app.services.auth.checkUserBelongsToOrg({
                authHeader: req.headers.authorization,
                orgId: req.body.orgId,
            });
            const domain = validateDocsDomain({ app, domain: req.body.domain });
            const customDomains = validateCustomDomains({ customDomains: req.body.customDomains });
            const docsRegistrationId = uuidv4();
            const s3FileInfos = await app.services.s3.getPresignedUploadUrls({
                domain: req.body.domain,
                filepaths: req.body.filepaths,
            });
            DOCS_REGISTRATIONS[docsRegistrationId] = {
                fernDomain: domain,
                customDomains,
                orgId: req.body.orgId,
                s3FileInfos,
                isPreview: false,
            };
            return res.send({
                docsRegistrationId,
                uploadUrls: Object.fromEntries(
                    Object.entries(s3FileInfos).map(([filepath, fileInfo]) => {
                        return [filepath, fileInfo.presignedUrl];
                    }),
                ),
            });
        },
        startDocsPreviewRegister: async (req, res) => {
            await app.services.auth.checkUserBelongsToOrg({
                authHeader: req.headers.authorization,
                orgId: req.body.orgId,
            });
            const docsRegistrationId = uuidv4();
            const fernDomain = `${req.body.orgId}-preview-${docsRegistrationId}.${app.config.domainSuffix}`;
            const s3FileInfos = await app.services.s3.getPresignedUploadUrls({
                domain: fernDomain,
                filepaths: req.body.filepaths,
            });
            DOCS_REGISTRATIONS[docsRegistrationId] = {
                fernDomain,
                customDomains: [],
                orgId: req.body.orgId,
                s3FileInfos,
                isPreview: true,
            };
            return res.send({
                docsRegistrationId,
                uploadUrls: Object.fromEntries(
                    Object.entries(s3FileInfos).map(([filepath, fileInfo]) => {
                        return [filepath, fileInfo.presignedUrl];
                    }),
                ),
                previewUrl: `https://${fernDomain}`,
            });
        },
        finishDocsRegister: async (req, res) => {
            const docsRegistrationInfo = DOCS_REGISTRATIONS[req.params.docsRegistrationId];
            if (docsRegistrationInfo == null) {
                throw new DocsV1Write.DocsRegistrationIdNotFound();
            }
            try {
                app.logger.info(`[${docsRegistrationInfo.fernDomain}] Called finishDocsRegister`);
                await app.services.auth.checkUserBelongsToOrg({
                    authHeader: req.headers.authorization,
                    orgId: docsRegistrationInfo.orgId,
                });

                app.logger.info(`[${docsRegistrationInfo.fernDomain}] Transforming Docs Definition to DB`);
                const dbDocsDefinition = transformWriteDocsDefinitionToDb({
                    writeShape: req.body.docsDefinition,
                    files: docsRegistrationInfo.s3FileInfos,
                });

                app.logger.info(`[${docsRegistrationInfo.fernDomain}] Generating new index segments`);
                const generateNewIndexSegmentsResult =
                    app.services.algoliaIndexSegmentManager.generateIndexSegmentsForDefinition({
                        dbDocsDefinition,
                        fernDomain: docsRegistrationInfo.fernDomain,
                    });
                const configSegmentTuples =
                    generateNewIndexSegmentsResult.type === "versioned"
                        ? generateNewIndexSegmentsResult.configSegmentTuples
                        : [generateNewIndexSegmentsResult.configSegmentTuple];
                const newIndexSegments = configSegmentTuples.map(([, seg]) => seg);

                const apiDefinitionsById = await (async () => {
                    const apiIdDefinitionTuples = await Promise.all(
                        dbDocsDefinition.referencedApis.map(
                            async (id) => [id, await app.services.db.getApiDefinition(id)] as const,
                        ),
                    );
                    return new Map(apiIdDefinitionTuples) as Map<string, APIV1Db.DbApiDefinition>;
                })();

                app.logger.info(`[${docsRegistrationInfo.fernDomain}] Generating search records for all versions`);
                const searchRecords = await app.services.algolia.generateSearchRecords({
                    docsDefinition: dbDocsDefinition,
                    apiDefinitionsById,
                    configSegmentTuples,
                });

                app.logger.info(`[${docsRegistrationInfo.fernDomain}] Uploading search records to Algolia`);
                await app.services.algolia.uploadSearchRecords(searchRecords);

                app.logger.info(`[${docsRegistrationInfo.fernDomain}] Updating db docs definitions`);
                await app.dao.docsV2().storeDocsDefinition({
                    docsRegistrationInfo,
                    dbDocsDefinition,
                    indexSegments: newIndexSegments,
                });

                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete DOCS_REGISTRATIONS[req.params.docsRegistrationId];

                const domains = [
                    docsRegistrationInfo.fernDomain,
                    ...docsRegistrationInfo.customDomains.map((domain) => `${domain.hostname}${domain.path}`),
                ];

                const results = await app.services.revalidator.revalidatePaths({
                    definition: {
                        apis: Object.fromEntries(
                            Object.entries(createObjectFromMap(apiDefinitionsById)).map(
                                ([definitionId, apiDefinition]) => {
                                    return [definitionId, convertApiDefinitionToRead(apiDefinition)];
                                },
                            ),
                        ),
                        config: convertDbDocsConfigToRead({
                            dbShape: dbDocsDefinition.config,
                        }),
                    },
                    domains,
                });

                if (results.error.length === 0) {
                    app.logger.info(`Successfully revalidated ${results.success.length} paths.`);
                } else {
                    await app.services.slack.notifyFailedToRevalidatePaths({
                        domain: docsRegistrationInfo.fernDomain,
                        paths: results,
                    });
                }

                return res.send();
            } catch (e) {
                app.logger.error(`Error while trying to register docs for ${docsRegistrationInfo.fernDomain}`, e);
                await app.services.slack.notifyFailedToRegisterDocs({
                    domain: docsRegistrationInfo.fernDomain,
                    err: e,
                });
                throw e;
            }
        },
    });
}
