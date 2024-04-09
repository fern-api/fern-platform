import { convertDocsDefinitionToDb, DocsV1Db } from "@fern-api/fdr-sdk";
import { AuthType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { APIV1Db, DocsV1Write, DocsV2Write, DocsV2WriteService, FdrAPI } from "../../../api";
import { type FdrApplication } from "../../../app";
import { IndexSegment } from "../../../services/algolia";
import { provideRevalidationClient } from "../../../services/revalidator/provideRevalidationClient";
import { type S3FileInfo } from "../../../services/s3";
import { WithoutQuestionMarks } from "../../../util";
import { ParsedBaseUrl } from "../../../util/ParsedBaseUrl";

const DOCS_REGISTRATIONS: Record<DocsV1Write.DocsRegistrationId, DocsRegistrationInfo> = {};

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

            // ensure that the domains are not already registered by another org
            app.dao.docsV2().checkDomainsDontBelongToAnotherOrg(
                [fernUrl, ...customUrls].map((url) => url.getFullUrl()),
                req.body.orgId,
            );

            const docsRegistrationId = uuidv4();
            const s3FileInfos = await app.services.s3.getPresignedUploadUrls({
                domain: req.body.domain,
                filepaths: req.body.filepaths,
                images: req.body.images ?? [],
            });

            await app.services.slack.notifyGeneratedDocs({
                orgId: req.body.orgId,
                urls: [fernUrl.toURL().toString(), ...customUrls.map((url) => url.toURL().toString())],
            });
            DOCS_REGISTRATIONS[docsRegistrationId] = {
                fernUrl,
                customUrls,
                orgId: req.body.orgId,
                s3FileInfos,
                isPreview: false,
                authType: req.body.authConfig?.type === "private" ? AuthType.WORKOS_SSO : AuthType.PUBLIC,
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
                images: req.body.images ?? [],
            });
            DOCS_REGISTRATIONS[docsRegistrationId] = {
                fernUrl,
                customUrls: [],
                orgId: req.body.orgId,
                s3FileInfos,
                isPreview: true,
                authType: req.body.authConfig?.type === "private" ? AuthType.WORKOS_SSO : AuthType.PUBLIC,
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

                // get previous slugs, some of which need to be invalidated
                let previousSlugs: string[] = [];
                try {
                    const client = provideRevalidationClient(docsRegistrationInfo.fernUrl);
                    previousSlugs = await client.listSlugs();
                } catch (e) {
                    // this is not a critical error, so we just log it. It's possible that the domain has never been registered before, or is a private docs instance.
                    app.logger.warn(`Failed to get previous slugs for ${docsRegistrationInfo.fernUrl.getFullUrl()}`, e);
                }

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

                const indexSegments = await uploadToAlgolia(
                    app,
                    docsRegistrationInfo,
                    dbDocsDefinition,
                    apiDefinitionsById,
                );

                await app.docsDefinitionCache.storeDocsForUrl({
                    docsRegistrationInfo,
                    dbDocsDefinition,
                    indexSegments,
                });

                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete DOCS_REGISTRATIONS[req.params.docsRegistrationId];

                /**
                 * IMPORTANT NOTE:
                 * vercel cache is not shared between custom domains, so we need to revalidate on EACH custom domain individually
                 * the only exception is for custom domains with subpaths, where we only revalidate the fernUrl
                 */

                const urls = [docsRegistrationInfo.fernUrl, ...docsRegistrationInfo.customUrls];

                const stagingUrl = createStagingUrl(docsRegistrationInfo.fernUrl);
                if (stagingUrl != null) {
                    // revalidation needs to occur separately for staging
                    urls.push(stagingUrl);
                }

                // revalidate all custom urls
                await Promise.all(
                    urls.map(async (baseUrl) => {
                        const results = await app.services.revalidator.revalidate({
                            // treat staging URL as its own fernURL to handle basepath revalidation
                            // fernUrl: baseUrl !== stagingUrl ? docsRegistrationInfo.fernUrl : stagingUrl,
                            baseUrl,
                            app,
                            oldSlugs: previousSlugs,
                        });
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
    });
}

async function uploadToAlgolia(
    app: FdrApplication,
    docsRegistrationInfo: DocsRegistrationInfo,
    dbDocsDefinition: WithoutQuestionMarks<DocsV1Db.DocsDefinitionDb>,
    apiDefinitionsById: Map<string, APIV1Db.DbApiDefinition>,
): Promise<IndexSegment[]> {
    // TODO: make sure to store private docs index into user-restricted algolia index
    // see https://www.algolia.com/doc/guides/security/api-keys/how-to/user-restricted-access-to-data/
    if (docsRegistrationInfo.authType !== AuthType.PUBLIC) {
        return [];
    }

    // skip algolia step for preview
    if (docsRegistrationInfo.isPreview) {
        return [];
    }

    app.logger.debug(`[${docsRegistrationInfo.fernUrl.getFullUrl()}] Generating new index segments`);
    const generateNewIndexSegmentsResult = app.services.algoliaIndexSegmentManager.generateIndexSegmentsForDefinition({
        dbDocsDefinition,
        url: docsRegistrationInfo.fernUrl.getFullUrl(),
    });
    const configSegmentTuples =
        generateNewIndexSegmentsResult.type === "versioned"
            ? generateNewIndexSegmentsResult.configSegmentTuples
            : [generateNewIndexSegmentsResult.configSegmentTuple];
    const newIndexSegments = configSegmentTuples.map(([, seg]) => seg);

    app.logger.debug(`[${docsRegistrationInfo.fernUrl.getFullUrl()}] Generating search records for all versions`);
    const searchRecords = await app.services.algolia.generateSearchRecords({
        docsDefinition: dbDocsDefinition,
        apiDefinitionsById,
        configSegmentTuples,
    });

    app.logger.debug(`[${docsRegistrationInfo.fernUrl.getFullUrl()}] Uploading search records to Algolia`);
    await app.services.algolia.uploadSearchRecords(searchRecords);

    app.logger.debug(`[${docsRegistrationInfo.fernUrl.getFullUrl()}] Updating db docs definitions`);

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
