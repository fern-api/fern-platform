import { convertDocsDefinitionToDb } from "@fern-api/fdr-sdk";
import { v4 as uuidv4 } from "uuid";
import { DocsV1Write, DocsV1WriteService, FdrAPI } from "../../../api";
import type { FdrApplication } from "../../../app";
import { type S3FileInfo } from "../../../services/s3";
import { writeBuffer } from "../../../util";

const DOCS_REGISTRATIONS: Record<DocsV1Write.DocsRegistrationId, DocsRegistrationInfo> = {};

interface DocsRegistrationInfo {
    domain: string;
    orgId: FdrAPI.OrgId;
    s3FileInfos: Record<DocsV1Write.FilePath, S3FileInfo>;
}

export function getDocsWriteService(app: FdrApplication): DocsV1WriteService {
    return new DocsV1WriteService({
        startDocsRegister: async (req, res) => {
            await app.services.auth.checkUserBelongsToOrg({
                authHeader: req.headers.authorization,
                orgId: req.body.orgId,
            });
            const docsRegistrationId = uuidv4();
            const s3FileInfos = await app.services.s3.getPresignedUploadUrls({
                domain: req.body.domain,
                filepaths: req.body.filepaths,
                images: [],
            });
            DOCS_REGISTRATIONS[docsRegistrationId] = {
                domain: req.body.domain,
                orgId: req.body.orgId,
                s3FileInfos,
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
        finishDocsRegister: async (req, res) => {
            const docsRegistrationInfo = DOCS_REGISTRATIONS[req.params.docsRegistrationId];
            if (docsRegistrationInfo == null) {
                throw new DocsV1Write.DocsRegistrationIdNotFound();
            }
            await app.services.auth.checkUserBelongsToOrg({
                authHeader: req.headers.authorization,
                orgId: docsRegistrationInfo.orgId,
            });
            const dbDocsDefinition = convertDocsDefinitionToDb({
                writeShape: req.body.docsDefinition,
                files: docsRegistrationInfo.s3FileInfos,
            });
            app.logger.info(
                `Docs for ${docsRegistrationInfo.orgId} has references to apis ${Array.from(
                    dbDocsDefinition.referencedApis,
                ).join(", ")}`,
            );
            await app.services.db.prisma.docs.upsert({
                create: {
                    url: docsRegistrationInfo.domain,
                    docsDefinition: writeBuffer(dbDocsDefinition),
                },
                update: {
                    docsDefinition: writeBuffer(dbDocsDefinition),
                },
                where: {
                    url: docsRegistrationInfo.domain,
                },
            });
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete DOCS_REGISTRATIONS[req.params.docsRegistrationId];
            return res.send();
        },
    });
}
