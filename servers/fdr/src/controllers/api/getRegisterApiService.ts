import { APIV1Write, SDKSnippetHolder, convertAPIDefinitionToDb } from "@fern-api/fdr-sdk";
import { v4 as uuidv4 } from "uuid";
import { APIV1WriteService } from "../../api";
import { SdkRequest } from "../../api/generated/api";
import type { FdrApplication } from "../../app";
import { LOGGER } from "../../app/FdrApplication";
import { SdkIdForPackage } from "../../db/sdk/SdkDao";
import { SnippetTemplatesByEndpoint } from "../../db/snippets/SnippetTemplate";
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
            const snippetsConfiguration = req.body.definition.snippetsConfiguration ?? {};

            const snippetsConfigurationWithSdkIds = await app.dao.sdks().getSdkIdsForPackages(snippetsConfiguration);
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
            const snippetTemplatesByEndpoint = await getSnippetTemplatesIfEnabled({
                app,
                authorization: req.headers.authorization,
                orgId: req.body.orgId,
                apiId: req.body.apiId,
                definition: req.body.definition,
                snippetsConfigurationWithSdkIds,
            });
            const apiDefinitionId = uuidv4();
            const snippetHolder = new SDKSnippetHolder({
                snippetsBySdkId,
                snippetsConfigWithSdkId: snippetsConfigurationWithSdkIds,
                snippetTemplatesByEndpoint,
            });
            const transformedApiDefinition = convertAPIDefinitionToDb(
                req.body.definition,
                apiDefinitionId,
                snippetHolder,
            );
            app.logger.debug(
                `Creating API Definition in database with name=${req.body.apiId} for org ${req.body.orgId}`,
                REGISTER_API_DEFINITION_META,
            );
            await app.services.db.prisma.apiDefinitionsV2.create({
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
            });
        },
    });
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
    orgId: string;
    apiId: string;
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
                    throw new Error(
                        `Invalid coordinate for Java SDK: ${coordinate}. Must be in the format group:artifact`,
                    );
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
