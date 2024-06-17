import { convertDocsDefinitionToDb, DocsV1Db } from "@fern-api/fdr-sdk";
import { AuthType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { APIV1Db, DocsV1Write, DocsV2Write, DocsV2WriteService, FdrAPI } from "../../../api";
import { type FdrApplication } from "../../../app";
import { IndexSegment } from "../../../services/algolia";
import { type S3FileInfo } from "../../../services/s3";
import { WithoutQuestionMarks } from "../../../util";
import { ParsedBaseUrl } from "../../../util/ParsedBaseUrl";

export interface DocsRegistrationInfo {
    fernUrl: ParsedBaseUrl;
    customUrls: ParsedBaseUrl[];
    orgId: FdrAPI.OrgId;
    s3FileInfos: Record<DocsV1Write.FilePath, S3FileInfo>;
    isPreview: boolean;
    authType: AuthType;
}

function validateAndParseFernDomainUrl({ app, url }: { app: FdrApplication; url: string }): ParsedBaseUrl {
    const baseUrl = ParsedBaseUrl.parse(url);
    if (!baseUrl.hostname.endsWith(app.config.domainSuffix)) {
        throw new DocsV2Write.InvalidDomainError();
    }
    return baseUrl;
}

function parseCustomDomainUrls({ customUrls }: { customUrls: string[] }): ParsedBaseUrl[] {
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
            const customUrls = parseCustomDomainUrls({ customUrls: req.body.customDomains });

            // ensure that the domains are not already registered by another org
            const hasOwnership = await app.dao.docsV2().checkDomainsDontBelongToAnotherOrg(
                [fernUrl, ...customUrls].map((url) => url.getFullUrl()),
                req.body.orgId,
            );
            if (!hasOwnership) {
                throw new FdrAPI.DomainBelongsToAnotherOrgError();
            }

            const docsRegistrationId = uuidv4();
            const s3FileInfos = await app.services.s3.getPresignedUploadUrls({
                domain: req.body.domain,
                filepaths: req.body.filepaths,
                images: req.body.images ?? [],
                isPrivate: req.body.authConfig?.type === "private",
            });

            await app.services.slack.notifyGeneratedDocs({
                orgId: req.body.orgId,
                urls: [fernUrl.toURL().toString(), ...customUrls.map((url) => url.toURL().toString())],
            });
            await app.dao.docsRegistration().storeDocsRegistrationById(docsRegistrationId, {
                fernUrl,
                customUrls,
                orgId: req.body.orgId,
                s3FileInfos,
                isPreview: false,
                authType: req.body.authConfig?.type === "private" ? AuthType.WORKOS_SSO : AuthType.PUBLIC,
            });
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
                images: req.body.images ?? [],
                isPrivate: req.body.authConfig?.type === "private",
            });
            await app.dao.docsRegistration().storeDocsRegistrationById(docsRegistrationId, {
                fernUrl,
                customUrls: [],
                orgId: req.body.orgId,
                s3FileInfos,
                isPreview: true,
                authType: req.body.authConfig?.type === "private" ? AuthType.WORKOS_SSO : AuthType.PUBLIC,
            });
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
            const docsRegistrationInfo = await app.dao
                .docsRegistration()
                .getDocsRegistrationById(req.params.docsRegistrationId);
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

                const apiDefinitionsById = await (async () => {
                    const apiIdDefinitionTuples = await Promise.all(
                        dbDocsDefinition.referencedApis.map(
                            async (id) => [id, await app.services.db.getApiDefinition(id)] as const,
                        ),
                    );
                    return new Map(apiIdDefinitionTuples) as Map<string, APIV1Db.DbApiDefinition>;
                })();

                const indexSegments =
                    docsRegistrationInfo.isPreview || docsRegistrationInfo.authType !== AuthType.PUBLIC
                        ? []
                        : await uploadToAlgolia(
                              app,
                              docsRegistrationInfo.fernUrl,
                              dbDocsDefinition,
                              apiDefinitionsById,
                          );

                await app.docsDefinitionCache.storeDocsForUrl({
                    docsRegistrationInfo,
                    dbDocsDefinition,
                    indexSegments,
                });

                /**
                 * IMPORTANT NOTE:
                 * vercel cache is not shared between custom domains, so we need to revalidate on EACH custom domain individually
                 */
                const urls = [docsRegistrationInfo.fernUrl, ...docsRegistrationInfo.customUrls];

                // const stagingUrl = createStagingUrl(docsRegistrationInfo.fernUrl);
                // if (stagingUrl != null) {
                //     // revalidation needs to occur separately for staging
                //     urls.push(stagingUrl);
                // }

                // revalidate all custom urls
                await Promise.all(
                    urls.map(async (baseUrl) => {
                        const results = await app.services.revalidator.revalidate({ baseUrl, app });
                        if (
                            results.response != null &&
                            results.response.failedRevalidations.length === 0 &&
                            !results.revalidationFailed
                        ) {
                            app.logger.info(
                                `Successfully revalidated ${results.response.successfulRevalidations.length} paths.`,
                            );
                        } else {
                            await app.services.slack.notifyFailedToRevalidatePaths({
                                domain: baseUrl.getFullUrl(),
                                paths: results,
                            });
                        }
                    }),
                );

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
        reindexAlgoliaSearchRecords: async (req, res) => {
            const parsedUrl = ParsedBaseUrl.parse(req.body.url);
            const response = await app.dao.docsV2().loadDocsForURL(parsedUrl.toURL());

            if (response == null) {
                throw new DocsV2Write.DocsNotFoundError();
            }

            if (response.authType !== AuthType.PUBLIC) {
                throw new DocsV2Write.ReindexNotAllowedError();
            }

            const apiDefinitionsById = await (async () => {
                const apiIdDefinitionTuples = await Promise.all(
                    response.docsDefinition.referencedApis.map(
                        async (id) => [id, await app.services.db.getApiDefinition(id)] as const,
                    ),
                );
                return new Map(apiIdDefinitionTuples) as Map<string, APIV1Db.DbApiDefinition>;
            })();

            const indexSegments = await uploadToAlgolia(
                app,
                ParsedBaseUrl.parse(response.domain),
                response.docsDefinition,
                apiDefinitionsById,
            );

            await app.docsDefinitionCache.storeDocsForUrl({
                // not sure if this is the right way to do it
                docsRegistrationInfo: {
                    fernUrl: ParsedBaseUrl.parse(response.domain),
                    orgId: response.orgId,
                    customUrls: [],
                    s3FileInfos: {},
                    isPreview: false,
                    authType: AuthType.PUBLIC,
                },
                dbDocsDefinition: response.docsDefinition,
                indexSegments,
            });

            res.send();
        },
    });
}

async function uploadToAlgolia(
    app: FdrApplication,
    // docsRegistrationInfo: DocsRegistrationInfo,
    url: ParsedBaseUrl,
    dbDocsDefinition: WithoutQuestionMarks<DocsV1Db.DocsDefinitionDb>,
    apiDefinitionsById: Map<string, APIV1Db.DbApiDefinition>,
): Promise<IndexSegment[]> {
    // // TODO: make sure to store private docs index into user-restricted algolia index
    // // see https://www.algolia.com/doc/guides/security/api-keys/how-to/user-restricted-access-to-data/
    // if (docsRegistrationInfo.authType !== AuthType.PUBLIC) {
    //     return [];
    // }

    // // skip algolia step for preview
    // if (docsRegistrationInfo.isPreview) {
    //     return [];
    // }

    app.logger.debug(`[${url.getFullUrl()}] Generating new index segments`);
    const generateNewIndexSegmentsResult = app.services.algoliaIndexSegmentManager.generateIndexSegmentsForDefinition({
        dbDocsDefinition,
        url: url.getFullUrl(),
    });
    const configSegmentTuples =
        generateNewIndexSegmentsResult.type === "versioned"
            ? generateNewIndexSegmentsResult.configSegmentTuples
            : [generateNewIndexSegmentsResult.configSegmentTuple];
    const newIndexSegments = configSegmentTuples.map(([, seg]) => seg);

    app.logger.debug(`[${url.getFullUrl()}] Generating search records for all versions`);
    const searchRecords = await app.services.algolia.generateSearchRecords({
        docsDefinition: dbDocsDefinition,
        apiDefinitionsById,
        configSegmentTuples,
    });

    app.logger.debug(`[${url.getFullUrl()}] Uploading search records to Algolia`);
    await app.services.algolia.uploadSearchRecords(searchRecords);

    app.logger.debug(`[${url.getFullUrl()}] Updating db docs definitions`);

    return newIndexSegments;
}

/**
 * This is a temporary solution to generate a staging URL from a production URL. It will ignore custom domains and dev domains.
 * @param url production URL
 * @returns staging URL or undefined if the URL is not a production URL
 */
function createStagingUrl(url: ParsedBaseUrl): ParsedBaseUrl | undefined {
    const maybeProdUrl = url.getFullUrl();
    if (maybeProdUrl.includes(".docs.buildwithfern.com")) {
        return ParsedBaseUrl.parse(maybeProdUrl.replace(".docs.buildwithfern.com", ".docs.staging.buildwithfern.com"));
    }
    return undefined;
}
