import { v4 as uuidv4 } from "uuid";
import { type FdrApplication } from "../../app";
import { ApiId, OrgId } from "../../generated/api";
import { DocsRegistrationId, FilePath } from "../../generated/api/resources/docs/resources/v1/resources/write";
import { DocsRegistrationIdNotFound } from "../../generated/api/resources/docs/resources/v1/resources/write/errors/DocsRegistrationIdNotFound";
import { InvalidCustomDomainError } from "../../generated/api/resources/docs/resources/v2/resources/write/errors/InvalidCustomDomainError";
import { InvalidDomainError } from "../../generated/api/resources/docs/resources/v2/resources/write/errors/InvalidDomainError";
import { WriteService } from "../../generated/api/resources/docs/resources/v2/resources/write/service/WriteService";
import { type S3FileInfo } from "../../services/s3";
import { getParsedUrl } from "../../util";
import { revalidateUrl } from "./revalidateUrl";
import { transformWriteDocsDefinitionToDb } from "./transformDocsDefinitionToDb";

const DOCS_REGISTRATIONS: Record<DocsRegistrationId, DocsRegistrationInfo> = {};

export interface DocsRegistrationInfo {
    fernDomain: string;
    customDomains: ParsedCustomDomain[];
    apiId: ApiId;
    orgId: OrgId;
    s3FileInfos: Record<FilePath, S3FileInfo>;
}

function validateDocsDomain({ app, domain }: { app: FdrApplication; domain: string }): string {
    const parsedUrl = getParsedUrl(domain);
    if (parsedUrl.hostname.endsWith(app.config.domainSuffix)) {
        return parsedUrl.hostname;
    }
    throw new InvalidDomainError();
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
                throw new InvalidCustomDomainError();
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

export function getDocsWriteV2Service(app: FdrApplication): WriteService {
    return new WriteService({
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
                apiId: req.body.apiId,
                s3FileInfos,
            };
            return res.send({
                docsRegistrationId,
                uploadUrls: Object.fromEntries(
                    Object.entries(s3FileInfos).map(([filepath, fileInfo]) => {
                        return [filepath, fileInfo.presignedUrl];
                    })
                ),
            });
        },
        finishDocsRegister: async (req, res) => {
            const docsRegistrationInfo = DOCS_REGISTRATIONS[req.params.docsRegistrationId];
            if (docsRegistrationInfo == null) {
                throw new DocsRegistrationIdNotFound();
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

                app.logger.info(`[${docsRegistrationInfo.fernDomain}] Generating search records for all versions`);
                const searchRecords = await app.services.algolia.generateSearchRecords(
                    dbDocsDefinition,
                    configSegmentTuples
                );

                app.logger.info(`[${docsRegistrationInfo.fernDomain}] Uploading search records to Algolia`);
                await app.services.algolia.uploadSearchRecords(searchRecords);

                app.logger.info(`[${docsRegistrationInfo.fernDomain}] Updating db docs definitions`);
                await app.services.db.updateDocsDefinitionAndIndexSegments({
                    dbDocsDefinition,
                    docsRegistrationInfo,
                    indexSegments: newIndexSegments,
                });

                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete DOCS_REGISTRATIONS[req.params.docsRegistrationId];

                // revalidate nextjs
                const urls = [
                    docsRegistrationInfo.fernDomain,
                    ...docsRegistrationInfo.customDomains.map((domain) => `${domain.hostname}${domain.path}`),
                ].map((url) => `https://${url}`);
                await Promise.all(
                    urls.map(async (url) => {
                        try {
                            app.logger.info(`[${docsRegistrationInfo.fernDomain}] Revalidating url: ${url}`);
                            await revalidateUrl(url);
                            app.logger.info(`[${docsRegistrationInfo.fernDomain}] Revalidated url: ${url}`);
                        } catch (e) {
                            app.logger.error(
                                `[${docsRegistrationInfo.fernDomain}] Failed to revalidate url: ${url}. ` +
                                    (e as Error).message
                            );
                            await app.services.slack.notifyFailedToRegisterDocs({
                                domain: docsRegistrationInfo.fernDomain,
                                err: e,
                            });
                        }
                    })
                );

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
