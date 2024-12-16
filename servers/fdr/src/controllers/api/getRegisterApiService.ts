import { APIV1Db, APIV1Write, FdrAPI, SDKSnippetHolder, convertAPIDefinitionToDb } from "@fern-api/fdr-sdk";
import { v4 as uuidv4 } from "uuid";
import { APIV1WriteService } from "../../api";
import { SdkRequest } from "../../api/generated/api";
import type { FdrApplication } from "../../app";
import { LOGGER } from "../../app/FdrApplication";
import { SdkIdForPackage } from "../../db/sdk/SdkDao";
import { SnippetTemplatesByEndpoint, SnippetTemplatesByEndpointIdentifier } from "../../db/snippets/SnippetTemplate";
import { writeBuffer } from "../../util";

const REGISTER_API_DEFINITION_META = {
    service: "APIV1WriteService",
    endpoint: "registerApiDefinition",
};

export function getRegisterApiService(app: FdrApplication): APIV1WriteService {
    return new APIV1WriteService({
        registerApiDefinition: async (req, res) => {
            app.logger.debug(`Checking if user belongs to org ${req.body.orgId}`, REGISTER_API_DEFINITION_META);
            await app.services.auth.checkUserBelongsToOrg({
                authHeader: req.headers.authorization,
                orgId: req.body.orgId,
            });

            const apiDefinitionId = FdrAPI.ApiDefinitionId(uuidv4());
            let transformedApiDefinition: APIV1Db.DbApiDefinition | FdrAPI.api.latest.ApiDefinition | undefined;

            if (req.body.definition != null) {
                const snippetsConfiguration = req.body.definition.snippetsConfiguration ?? {
                    typescriptSdk: undefined,
                    pythonSdk: undefined,
                    javaSdk: undefined,
                    goSdk: undefined,
                    rubySdk: undefined,
                };

                const snippetsConfigurationWithSdkIds = await app.dao
                    .sdks()
                    .getSdkIdsForPackages(snippetsConfiguration);
                const sdkIds: string[] = [];
                if (snippetsConfigurationWithSdkIds.typescriptSdk != null) {
                    sdkIds.push(snippetsConfigurationWithSdkIds.typescriptSdk.sdkId);
                }
                if (snippetsConfigurationWithSdkIds.pythonSdk != null) {
                    sdkIds.push(snippetsConfigurationWithSdkIds.pythonSdk.sdkId);
                }
                if (snippetsConfigurationWithSdkIds.javaSdk != null) {
                    sdkIds.push(snippetsConfigurationWithSdkIds.javaSdk.sdkId);
                }
                if (snippetsConfigurationWithSdkIds.goSdk != null) {
                    sdkIds.push(snippetsConfigurationWithSdkIds.goSdk.sdkId);
                }
                if (snippetsConfigurationWithSdkIds.rubySdk != null) {
                    sdkIds.push(snippetsConfigurationWithSdkIds.rubySdk.sdkId);
                }

                const snippetsBySdkId = await app.dao.snippets().loadAllSnippetsForSdkIds(sdkIds);
                const snippetsBySdkIdAndEndpointId = await app.dao
                    .snippets()
                    .loadAllSnippetsForSdkIdsByEndpointId(sdkIds);
                const snippetTemplatesByEndpoint = await getSnippetTemplatesIfEnabled({
                    app,
                    authorization: req.headers.authorization,
                    orgId: req.body.orgId,
                    apiId: req.body.apiId,
                    definition: req.body.definition,
                    snippetsConfigurationWithSdkIds,
                });
                const snippetTemplatesByEndpointId = await getSnippetTemplatesByEndpointIdIfEnabled({
                    app,
                    authorization: req.headers.authorization,
                    orgId: req.body.orgId,
                    apiId: req.body.apiId,
                    definition: req.body.definition,
                    snippetsConfigurationWithSdkIds,
                });
                const snippetHolder = new SDKSnippetHolder({
                    snippetsBySdkId,
                    snippetsBySdkIdAndEndpointId,
                    snippetsConfigWithSdkId: snippetsConfigurationWithSdkIds,
                    snippetTemplatesByEndpoint,
                    snippetTemplatesByEndpointId,
                });
                transformedApiDefinition = convertAPIDefinitionToDb(
                    req.body.definition,
                    apiDefinitionId,
                    snippetHolder,
                );
            }

            let isLatest = false;
            if (transformedApiDefinition == null) {
                if (req.body.definitionLatest == null) {
                    throw new Error("No latest definition provided");
                }
                isLatest = true;
            }

            let sources: Record<string, APIV1Write.SourceUpload> | undefined;
            if (req.body.sources != null) {
                app.logger.debug(
                    `Preparing source upload URLs for {orgId: "${req.body.orgId}", apiId: "${req.body.apiId}"}`,
                    REGISTER_API_DEFINITION_META,
                );
                sources = await getSourceUploads({
                    app,
                    orgId: req.body.orgId,
                    apiId: req.body.apiId,
                    sources: req.body.sources,
                });
                app.logger.debug("Successfully prepared source upload URLs", REGISTER_API_DEFINITION_META);
            }

            app.logger.debug(
                `Creating API Definition in database with name=${req.body.apiId} for org ${req.body.orgId}`,
                REGISTER_API_DEFINITION_META,
            );
            await (
                isLatest ? app.services.db.prisma.apiDefinitionsV2 : app.services.db.prisma.apiDefinitionsLatest
            ).create({
                data: {
                    apiDefinitionId,
                    apiName: req.body.apiId,
                    orgId: req.body.orgId,
                    definition: writeBuffer(transformedApiDefinition),
                },
            });
            app.logger.debug(`Returning API Definition ID id=${apiDefinitionId}`, REGISTER_API_DEFINITION_META);
            return res.send({
                apiDefinitionId,
                sources,
            });
        },
    });
}

function getSnippetSdkRequests({
    snippetsConfigurationWithSdkIds,
}: {
    snippetsConfigurationWithSdkIds: SdkIdForPackage;
}): SdkRequest[] {
    const sdkRequests: SdkRequest[] = [];
    if (snippetsConfigurationWithSdkIds.typescriptSdk != null) {
        sdkRequests.push({
            type: "typescript",
            package: snippetsConfigurationWithSdkIds.typescriptSdk.package,
            version: snippetsConfigurationWithSdkIds.typescriptSdk.version,
        });
    }
    if (snippetsConfigurationWithSdkIds.pythonSdk != null) {
        sdkRequests.push({
            type: "python",
            package: snippetsConfigurationWithSdkIds.pythonSdk.package,
            version: snippetsConfigurationWithSdkIds.pythonSdk.version,
        });
    }
    if (snippetsConfigurationWithSdkIds.javaSdk != null) {
        const coordinate = snippetsConfigurationWithSdkIds.javaSdk.coordinate;
        const [group, artifact] = coordinate.split(":");
        if (group == null || artifact == null) {
            throw new Error(`Invalid coordinate for Java SDK: ${coordinate}. Must be in the format group:artifact`);
        }
        sdkRequests.push({
            type: "java",
            group,
            artifact,
            version: snippetsConfigurationWithSdkIds.javaSdk.version,
        });
    }
    if (snippetsConfigurationWithSdkIds.goSdk != null) {
        sdkRequests.push({
            type: "go",
            githubRepo: snippetsConfigurationWithSdkIds.goSdk.githubRepo,
            version: snippetsConfigurationWithSdkIds.goSdk.version,
        });
    }
    if (snippetsConfigurationWithSdkIds.rubySdk != null) {
        sdkRequests.push({
            type: "ruby",
            gem: snippetsConfigurationWithSdkIds.rubySdk.gem,
            version: snippetsConfigurationWithSdkIds.rubySdk.version,
        });
    }
    return sdkRequests;
}

async function getSnippetTemplatesByEndpointIdIfEnabled({
    app,
    authorization,
    orgId,
    apiId,
    definition,
    snippetsConfigurationWithSdkIds,
}: {
    app: FdrApplication;
    authorization: string | undefined;
    orgId: FdrAPI.OrgId;
    apiId: FdrAPI.ApiId;
    definition: APIV1Write.ApiDefinition;
    snippetsConfigurationWithSdkIds: SdkIdForPackage;
}): Promise<SnippetTemplatesByEndpointIdentifier> {
    try {
        const hasSnippetTemplatesAccess = await app.services.auth.checkOrgHasSnippetTemplateAccess({
            authHeader: authorization,
            orgId,
            failHard: false,
        });
        let snippetTemplatesByEndpoint: SnippetTemplatesByEndpointIdentifier = {};
        if (hasSnippetTemplatesAccess) {
            const sdkRequests = getSnippetSdkRequests({ snippetsConfigurationWithSdkIds });
            snippetTemplatesByEndpoint = await app.dao.snippetTemplates().loadSnippetTemplatesByEndpointIdentifier({
                orgId,
                apiId,
                sdkRequests,
                definition,
            });
        }
        return snippetTemplatesByEndpoint;
    } catch (e) {
        LOGGER.error("Failed to load snippet templates", e);
        return {};
    }
}

async function getSnippetTemplatesIfEnabled({
    app,
    authorization,
    orgId,
    apiId,
    definition,
    snippetsConfigurationWithSdkIds,
}: {
    app: FdrApplication;
    authorization: string | undefined;
    orgId: FdrAPI.OrgId;
    apiId: FdrAPI.ApiId;
    definition: APIV1Write.ApiDefinition;
    snippetsConfigurationWithSdkIds: SdkIdForPackage;
}): Promise<SnippetTemplatesByEndpoint> {
    try {
        const hasSnippetTemplatesAccess = await app.services.auth.checkOrgHasSnippetTemplateAccess({
            authHeader: authorization,
            orgId,
            failHard: false,
        });
        let snippetTemplatesByEndpoint: SnippetTemplatesByEndpoint = {};
        if (hasSnippetTemplatesAccess) {
            const sdkRequests = getSnippetSdkRequests({ snippetsConfigurationWithSdkIds });
            snippetTemplatesByEndpoint = await app.dao.snippetTemplates().loadSnippetTemplatesByEndpoint({
                orgId,
                apiId,
                sdkRequests,
                definition,
            });
        }
        return snippetTemplatesByEndpoint;
    } catch (e) {
        LOGGER.error("Failed to load snippet templates", e);
        return {};
    }
}

async function getSourceUploads({
    app,
    orgId,
    apiId,
    sources,
}: {
    app: FdrApplication;
    orgId: FdrAPI.OrgId;
    apiId: FdrAPI.ApiId;
    sources: Record<string, APIV1Write.Source>;
}): Promise<Record<string, APIV1Write.SourceUpload>> {
    const sourceUploadUrls = await app.services.s3.getPresignedApiDefinitionSourceUploadUrls({
        orgId,
        apiId,
        sources,
    });

    const sourceUploads = await Promise.all(
        Object.entries(sourceUploadUrls).map(async ([sourceId, fileInfo]) => {
            const downloadUrl = await app.services.s3.getPresignedApiDefinitionSourceDownloadUrl({
                key: fileInfo.key,
            });

            return [
                sourceId,
                {
                    uploadUrl: fileInfo.presignedUrl,
                    downloadUrl,
                },
            ];
        }),
    );

    return Object.fromEntries(sourceUploads);
}
