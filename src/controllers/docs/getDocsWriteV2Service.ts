import { v4 as uuidv4 } from "uuid";
import { type FdrApplication } from "../../app";
import { ApiId, OrgId } from "../../generated/api";
import { DocsRegistrationId, FilePath } from "../../generated/api/resources/docs/resources/v1/resources/write";
import { DocsRegistrationIdNotFound } from "../../generated/api/resources/docs/resources/v1/resources/write/errors/DocsRegistrationIdNotFound";
import { InvalidCustomDomainError } from "../../generated/api/resources/docs/resources/v2/resources/write/errors/InvalidCustomDomainError";
import { InvalidDomainError } from "../../generated/api/resources/docs/resources/v2/resources/write/errors/InvalidDomainError";
import { WriteService } from "../../generated/api/resources/docs/resources/v2/resources/write/service/WriteService";
import { generateAlgoliaRecords } from "../../services/algolia/generateAlgoliaRecords";
import { type S3FileInfo } from "../../services/s3";
import { getParsedUrl, writeBuffer } from "../../util";
import { transformWriteDocsDefinitionToDb } from "./transformDocsDefinitionToDb";

const DOCS_REGISTRATIONS: Record<DocsRegistrationId, DocsRegistrationInfo> = {};

interface DocsRegistrationInfo {
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

            const bufferDocsDefinition = writeBuffer(dbDocsDefinition);

            const newAlgoliaIndex = `${docsRegistrationInfo.fernDomain}_${uuidv4()}`;

            const createNewIndex = async () => {
                const records = await generateAlgoliaRecords(dbDocsDefinition, (id) =>
                    app.services.db.getApiDefinition(id)
                );
                await Promise.all([
                    app.services.algolia.saveIndexRecords(newAlgoliaIndex, records),
                    app.services.algolia.saveIndexSettings(newAlgoliaIndex),
                ]);
            };

            const updateDbDocs = async () => {
                return await app.services.db.prisma.$transaction(async (tx) => {
                    const writeOriginalDocs = async () => {
                        const retrievePrevDocs = () =>
                            tx.docsV2.findFirst({
                                where: {
                                    domain: docsRegistrationInfo.fernDomain,
                                    path: "",
                                },
                            });

                        const upsertDocs = () =>
                            tx.docsV2.upsert({
                                where: {
                                    domain_path: {
                                        domain: docsRegistrationInfo.fernDomain,
                                        path: "",
                                    },
                                },
                                update: {
                                    docsDefinition: bufferDocsDefinition,
                                    apiName: docsRegistrationInfo.apiId,
                                    orgID: docsRegistrationInfo.orgId,
                                    algoliaIndex: newAlgoliaIndex,
                                },
                                create: {
                                    docsDefinition: bufferDocsDefinition,
                                    domain: docsRegistrationInfo.fernDomain,
                                    path: "",
                                    apiName: docsRegistrationInfo.apiId,
                                    orgID: docsRegistrationInfo.orgId,
                                    algoliaIndex: newAlgoliaIndex,
                                },
                            });

                        const [prevDocs, newDocs] = await Promise.all([retrievePrevDocs(), upsertDocs()]);
                        return { prevDocs, newDocs };
                    };

                    const writeCustomDomainDocs = async () => {
                        await Promise.all(
                            docsRegistrationInfo.customDomains.map(async (customDomain) => {
                                await tx.docsV2.upsert({
                                    where: {
                                        domain_path: {
                                            domain: customDomain.hostname,
                                            path: customDomain.path,
                                        },
                                    },
                                    create: {
                                        docsDefinition: bufferDocsDefinition,
                                        domain: customDomain.hostname,
                                        path: customDomain.path,
                                        apiName: docsRegistrationInfo.apiId,
                                        orgID: docsRegistrationInfo.orgId,
                                        algoliaIndex: newAlgoliaIndex,
                                    },
                                    update: {
                                        docsDefinition: bufferDocsDefinition,
                                        apiName: docsRegistrationInfo.apiId,
                                        orgID: docsRegistrationInfo.orgId,
                                        algoliaIndex: newAlgoliaIndex,
                                    },
                                });
                            })
                        );
                    };

                    const [result] = await Promise.all([writeOriginalDocs(), writeCustomDomainDocs()]);
                    return result;
                });
            };

            app.logger.info(`[${docsRegistrationInfo.fernDomain}] Updating db docs and creating new algolia index`);
            const [{ prevDocs }] = await Promise.all([updateDbDocs(), createNewIndex()]);

            const markIndexForDeletion = async () => {
                if (prevDocs?.algoliaIndex) {
                    await app.services.db.markIndexForDeletion(prevDocs.algoliaIndex);
                }
            };

            app.logger.info(`[${docsRegistrationInfo.fernDomain}] Marking previous docs for deletion`);
            await markIndexForDeletion();

            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete DOCS_REGISTRATIONS[req.params.docsRegistrationId];
            return res.send();
        },
    });
}
