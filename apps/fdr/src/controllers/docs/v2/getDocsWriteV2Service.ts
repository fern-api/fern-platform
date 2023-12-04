import { convertDbAPIDefinitionToRead, convertDbDocsConfigToRead, convertDocsDefinitionToDb } from "@fern-api/fdr-sdk";
import { v4 as uuidv4 } from "uuid";
import { APIV1Db, DocsV1Write, DocsV2Write, DocsV2WriteService, FdrAPI } from "../../../api";
import { type FdrApplication } from "../../../app";
import { type S3FileInfo } from "../../../services/s3";
import { ParsedBaseUrl } from "../../../util/ParsedBaseUrl";
import { createObjectFromMap } from "../../../util/object";

const DOCS_REGISTRATIONS: Record<DocsV1Write.DocsRegistrationId, DocsRegistrationInfo> = {};

export interface DocsRegistrationInfo {
    fernUrl: ParsedBaseUrl;
    customUrls: ParsedBaseUrl[];
    orgId: FdrAPI.OrgId;
    s3FileInfos: Record<DocsV1Write.FilePath, S3FileInfo>;
    isPreview: boolean;
}

function validateAndParseFernDomainUrl({ app, url }: { app: FdrApplication; url: string }): ParsedBaseUrl {
    const baseUrl = ParsedBaseUrl.parse(url);
    if (!baseUrl.hostname.endsWith(app.config.domainSuffix)) {
        throw new DocsV2Write.InvalidDomainError();
    }
    return baseUrl;
}

function validateAndParseCustomDomainUrl({ customUrls }: { customUrls: string[] }): ParsedBaseUrl[] {
    for (let i = 0; i < customUrls.length; ++i) {
        const one = customUrls[i];
        for (let j = i + 1; j < customUrls.length; ++j) {
            const two = customUrls[j];
            if (one == null || two == null) {
                continue;
            }
            if (one.includes(two) || two.includes(one)) {
                throw new DocsV2Write.InvalidCustomDomainError();
            }
        }
    }

    const parsedUrls: ParsedBaseUrl[] = [];
    for (const customUrl of customUrls) {
        const baseUrl = ParsedBaseUrl.parse(customUrl);
        parsedUrls.push(baseUrl);
    }
    return parsedUrls;
}

export function getDocsWriteV2Service(app: FdrApplication): DocsV2WriteService {
    return new DocsV2WriteService({
        startDocsRegister: async (req, res) => {
            await app.services.auth.checkUserBelongsToOrg({
                authHeader: req.headers.authorization,
                orgId: req.body.orgId,
            });
            const fernUrl = validateAndParseFernDomainUrl({ app, url: req.body.domain });
            const customUrls = validateAndParseCustomDomainUrl({ customUrls: req.body.customDomains });
            const docsRegistrationId = uuidv4();
            const s3FileInfos = await app.services.s3.getPresignedUploadUrls({
                domain: req.body.domain,
                filepaths: req.body.filepaths,
            });

            await app.services.slack.notifyGeneratedDocs({
                orgId: req.body.orgId,
                urls: [fernUrl.toURL().toString(), ...customUrls.map((url) => url.toURL().toString())],
            });
            DOCS_REGISTRATIONS[docsRegistrationId] = {
                fernUrl: fernUrl,
                customUrls: customUrls,
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
            const fernUrl = ParsedBaseUrl.parse(
                `${req.body.orgId}-preview-${docsRegistrationId}.${app.config.domainSuffix}`,
            );
            const s3FileInfos = await app.services.s3.getPresignedUploadUrls({
                domain: fernUrl.hostname,
                filepaths: req.body.filepaths,
            });
            DOCS_REGISTRATIONS[docsRegistrationId] = {
                fernUrl,
                customUrls: [],
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
                previewUrl: `https://${fernUrl.getFullUrl()}`,
            });
        },
        finishDocsRegister: async (req, res) => {
            const docsRegistrationInfo = DOCS_REGISTRATIONS[req.params.docsRegistrationId];
            if (docsRegistrationInfo == null) {
                throw new DocsV1Write.DocsRegistrationIdNotFound();
            }
            try {
                app.logger.debug(`[${docsRegistrationInfo.fernUrl.getFullUrl()}] Called finishDocsRegister`);
                await app.services.auth.checkUserBelongsToOrg({
                    authHeader: req.headers.authorization,
                    orgId: docsRegistrationInfo.orgId,
                });

                app.logger.debug(`[${docsRegistrationInfo.fernUrl.getFullUrl()}] Transforming Docs Definition to DB`);
                const dbDocsDefinition = convertDocsDefinitionToDb({
                    writeShape: req.body.docsDefinition,
                    files: docsRegistrationInfo.s3FileInfos,
                });

                app.logger.debug(`[${docsRegistrationInfo.fernUrl.getFullUrl()}] Generating new index segments`);
                const generateNewIndexSegmentsResult =
                    app.services.algoliaIndexSegmentManager.generateIndexSegmentsForDefinition({
                        dbDocsDefinition,
                        url: docsRegistrationInfo.fernUrl.getFullUrl(),
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

                app.logger.debug(
                    `[${docsRegistrationInfo.fernUrl.getFullUrl()}] Generating search records for all versions`,
                );
                const searchRecords = await app.services.algolia.generateSearchRecords({
                    docsDefinition: dbDocsDefinition,
                    apiDefinitionsById,
                    configSegmentTuples,
                });

                app.logger.debug(`[${docsRegistrationInfo.fernUrl.getFullUrl()}] Uploading search records to Algolia`);
                await app.services.algolia.uploadSearchRecords(searchRecords);

                app.logger.debug(`[${docsRegistrationInfo.fernUrl.getFullUrl()}] Updating db docs definitions`);
                await app.docsDefinitionCache.storeDocsForUrl({
                    docsRegistrationInfo,
                    dbDocsDefinition,
                    indexSegments: newIndexSegments,
                });

                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete DOCS_REGISTRATIONS[req.params.docsRegistrationId];
                for (const baseUrl of [docsRegistrationInfo.fernUrl, ...docsRegistrationInfo.customUrls]) {
                    const results = await app.services.revalidator.revalidate({
                        definition: {
                            apis: Object.fromEntries(
                                Object.entries(createObjectFromMap(apiDefinitionsById)).map(
                                    ([definitionId, apiDefinition]) => {
                                        return [definitionId, convertDbAPIDefinitionToRead(apiDefinition)];
                                    },
                                ),
                            ),
                            config: convertDbDocsConfigToRead({
                                dbShape: dbDocsDefinition.config,
                            }),
                        },
                        baseUrl,
                    });
                    if (results.failedRevalidations.length === 0) {
                        app.logger.info(`Successfully revalidated ${results.successfulRevalidations.length} paths.`);
                    } else {
                        await app.services.slack.notifyFailedToRevalidatePaths({
                            domain: docsRegistrationInfo.fernUrl.getFullUrl(),
                            paths: results,
                        });
                    }
                }

                return res.send();
            } catch (e) {
                app.logger.error(`Error while trying to register docs for ${docsRegistrationInfo.fernUrl}`, e);
                await app.services.slack.notifyFailedToRegisterDocs({
                    domain: docsRegistrationInfo.fernUrl.getFullUrl(),
                    err: e,
                });
                throw e;
            }
        },
    });
}
