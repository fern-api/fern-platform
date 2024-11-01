import { APIV1Db, convertDocsDefinitionToDb, DocsV1Db, DocsV1Write, FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { generateAlgoliaRecords } from "@fern-ui/fern-docs-search-server";
import { AuthType } from "@prisma/client";
import urlJoin from "url-join";
import { v4 as uuidv4 } from "uuid";
import { DocsV2WriteService } from "../../../api";
import { DomainBelongsToAnotherOrgError } from "../../../api/generated/api/resources/commons/errors";
import { DocsRegistrationIdNotFound } from "../../../api/generated/api/resources/docs/resources/v1/resources/write/errors";
import { LoadDocsForUrlResponse } from "../../../api/generated/api/resources/docs/resources/v2/resources/read";
import {
    DocsNotFoundError,
    InvalidDomainError,
    ReindexNotAllowedError,
} from "../../../api/generated/api/resources/docs/resources/v2/resources/write/errors";
import { type FdrApplication } from "../../../app";
import { IndexSegment } from "../../../services/algolia";
import { type S3DocsFileInfo } from "../../../services/s3";
import { WithoutQuestionMarks } from "../../../util";
import { ParsedBaseUrl } from "../../../util/ParsedBaseUrl";
import { getDocsDefinition } from "../v1/getDocsReadService";

export interface DocsRegistrationInfo {
    fernUrl: ParsedBaseUrl;
    customUrls: ParsedBaseUrl[];
    orgId: FdrAPI.OrgId;
    s3FileInfos: Record<DocsV1Write.FilePath, S3DocsFileInfo>;
    isPreview: boolean;
    authType: AuthType;
}

function validateAndParseFernDomainUrl({ app, url }: { app: FdrApplication; url: string }): ParsedBaseUrl {
    const baseUrl = ParsedBaseUrl.parse(url);
    if (!baseUrl.hostname.endsWith(app.config.domainSuffix)) {
        throw new InvalidDomainError();
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
            const { allDomainsOwned: hasOwnership, unownedDomains } = await app.dao
                .docsV2()
                .checkDomainsDontBelongToAnotherOrg(
                    [fernUrl, ...customUrls].map((url) => url.getFullUrl()),
                    req.body.orgId,
                );
            if (!hasOwnership) {
                throw new DomainBelongsToAnotherOrgError(
                    `The following domains belong to another organization: ${unownedDomains.join(", ")}`,
                );
            }

            const docsRegistrationId = DocsV1Write.DocsRegistrationId(uuidv4());
            const s3FileInfos = await app.services.s3.getPresignedDocsAssetsUploadUrls({
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
            const docsRegistrationId = DocsV1Write.DocsRegistrationId(uuidv4());
            const fernUrl = ParsedBaseUrl.parse(
                urlJoin(
                    `${req.body.orgId}-preview-${docsRegistrationId}.${app.config.domainSuffix}`,
                    req.body.basePath ?? "",
                ),
            );
            const s3FileInfos = await app.services.s3.getPresignedDocsAssetsUploadUrls({
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
                throw new DocsRegistrationIdNotFound();
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

                const apiDefinitions = (
                    await Promise.all(
                        dbDocsDefinition.referencedApis.map(async (id) => await app.services.db.getApiDefinition(id)),
                    )
                ).filter(isNonNullish);
                const apiDefinitionsById = Object.fromEntries(
                    apiDefinitions.map((definition) => [definition.id, definition]),
                );

                const warmEndpointCachePromises = apiDefinitions.flatMap((apiDefinition) => {
                    return Object.entries(apiDefinition.subpackages).flatMap(([id, subpackage]) => {
                        return subpackage.endpoints.map(async (endpoint) => {
                            return await fetch(
                                `https://${docsRegistrationInfo.fernUrl.getFullUrl()}/api/fern-docs/api-definition/${apiDefinition.id}/endpoint/${endpoint.originalEndpointId}`,
                            );
                        });
                    });
                });

                const response = await app.dao.docsV2().loadDocsForURL(docsRegistrationInfo.fernUrl.getFullUrl());

                const definition = await getDocsDefinition({
                    app,
                    docsDbDefinition: dbDocsDefinition,
                    docsV2: response,
                });

                const loadDocsForUrlResponse: LoadDocsForUrlResponse = {
                    baseUrl: {
                        domain: docsRegistrationInfo.fernUrl.getFullUrl(),
                        basePath: .path.trim() === "" ? undefined : response.path.trim(),
                    },
                    definition,
                    lightModeEnabled: response.docsDefinition.config.colorsV3?.type !== "dark",
                };

                const indexSegments = await uploadToAlgoliaForRegistration(
                    app,
                    docsRegistrationInfo,
                    loadDocsForUrlResponse,
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

                try {
                    await Promise.all(
                        urls.map(async (baseUrl) => {
                            const results = await app.services.revalidator.revalidate({ baseUrl, app });
                            if (results.failed.length === 0 && !results.revalidationFailed) {
                                app.logger.info(`Successfully revalidated ${results.successful.length} paths.`);
                            } else {
                                await app.services.slack.notifyFailedToRevalidatePaths({
                                    domain: baseUrl.getFullUrl(),
                                    paths: results,
                                });
                            }
                        }),
                    );
                } catch (e) {
                    app.logger.error(`Error while trying to revalidate docs for ${docsRegistrationInfo.fernUrl}`, e);
                    await app.services.slack.notifyFailedToRegisterDocs({
                        domain: docsRegistrationInfo.fernUrl.getFullUrl(),
                        err: e,
                    });
                    throw e;
                }

                await Promise.all(warmEndpointCachePromises);

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
            // step 1. load from db
            const parsedUrl = ParsedBaseUrl.parse(req.body.url);
            const response = await app.dao.docsV2().loadDocsForURL(parsedUrl.toURL());

            if (response == null) {
                throw new DocsNotFoundError();
            }

            if (response.authType !== AuthType.PUBLIC || response.isPreview || response.docsConfigInstanceId == null) {
                throw new ReindexNotAllowedError();
            }

            const apiDefinitions = (
                await Promise.all(
                    response.docsDefinition.referencedApis.map(
                        async (id) => await app.services.db.getApiDefinition(id),
                    ),
                )
            ).filter(isNonNullish);
            const apiDefinitionsById = Object.fromEntries(
                apiDefinitions.map((definition) => [definition.id, definition]),
            );

            const definition = await getDocsDefinition({
                app,
                docsDbDefinition: response.docsDefinition,
                docsV2: response,
            });

            const loadDocsForUrlResponse: LoadDocsForUrlResponse = {
                baseUrl: {
                    domain: response.domain,
                    basePath: response.path.trim() === "" ? undefined : response.path.trim(),
                },
                definition,
                lightModeEnabled: response.docsDefinition.config.colorsV3?.type !== "dark",
            };

            // step 2. create new index segments in algolia
            const indexSegments = await uploadToAlgolia(
                app,
                ParsedBaseUrl.parse(response.domain),
                loadDocsForUrlResponse,
                response.docsDefinition,
                apiDefinitionsById,
            );

            // step 3. store docs + new algolia segments
            await app.docsDefinitionCache.replaceDocsForInstanceId({
                instanceId: response.docsConfigInstanceId,
                dbDocsDefinition: response.docsDefinition,
                indexSegments,
            });

            res.send();
        },
        transferOwnershipOfDomain: async (req, res) => {
            // only fern users can transfer domain ownership
            await app.services.auth.checkUserBelongsToOrg({
                authHeader: req.headers.authorization,
                orgId: "fern",
            });

            const parsedUrl = ParsedBaseUrl.parse(req.body.domain);

            await app.dao.docsV2().transferDomainOwner({
                domain: parsedUrl.getFullUrl(),
                toOrgId: req.body.toOrgId,
            });

            return res.send();
        },
    });
}

async function uploadToAlgoliaForRegistration(
    app: FdrApplication,
    docsRegistrationInfo: DocsRegistrationInfo,
    loadDocsForUrlResponse: LoadDocsForUrlResponse,
    dbDocsDefinition: WithoutQuestionMarks<DocsV1Db.DocsDefinitionDb>,
    apiDefinitionsById: Record<string, APIV1Db.DbApiDefinition>,
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

    return uploadToAlgolia(
        app,
        docsRegistrationInfo.fernUrl,
        loadDocsForUrlResponse,
        dbDocsDefinition,
        apiDefinitionsById,
    );
}

async function uploadToAlgolia(
    app: FdrApplication,
    url: ParsedBaseUrl,
    response: LoadDocsForUrlResponse,
    dbDocsDefinition: WithoutQuestionMarks<DocsV1Db.DocsDefinitionDb>,
    apiDefinitionsById: Record<string, APIV1Db.DbApiDefinition>,
): Promise<IndexSegment[]> {
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
        url: url.getFullUrl(),
        docsDefinition: dbDocsDefinition,
        apiDefinitionsById,
        configSegmentTuples,
    });

    configSegmentTuples.map(([_, indexSegment]) => {
        const v2Records = generateAlgoliaRecords({
            indexSegmentId: indexSegment.id,
            nodes: FernNavigation.utils.toRootNode(response),
            pages: FernNavigation.utils.toPages(response),
            apis: FernNavigation.utils.toApis(response),
            isFieldRecordsEnabled: false,
        });
        searchRecords.push(...v2Records);
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
