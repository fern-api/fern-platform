import { SDKSnippetHolder, convertAPIDefinitionToDb } from "@fern-api/fdr-sdk";
import { v4 as uuidv4 } from "uuid";
import { APIV1WriteService } from "../../api";
import { SdkRequest } from "../../api/generated/api";
import type { FdrApplication } from "../../app";
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
            const sdkRequests: SdkRequest[] = [];
            if (snippetsConfigurationWithSdkIds.typescriptSdk != null) {
                sdkIds.push(snippetsConfigurationWithSdkIds.typescriptSdk.sdkId);
                sdkRequests.push({
                    type: "typescript",
                    package: snippetsConfigurationWithSdkIds.typescriptSdk.package,
                    // TODO: support version
                });
            }
            if (snippetsConfigurationWithSdkIds.pythonSdk != null) {
                sdkIds.push(snippetsConfigurationWithSdkIds.pythonSdk.sdkId);
                sdkRequests.push({
                    type: "python",
                    package: snippetsConfigurationWithSdkIds.pythonSdk.package,
                    // TODO: support version
                });
            }
            if (snippetsConfigurationWithSdkIds.javaSdk != null) {
                sdkIds.push(snippetsConfigurationWithSdkIds.javaSdk.sdkId);
                // TODO: support parsing coordinate -> group, artifact, version
                // sdkRequests.push({
                //     type: "java",
                //     group: snippetsConfigurationWithSdkIds.javaSdk.coordinate,
                // });
            }
            if (snippetsConfigurationWithSdkIds.goSdk != null) {
                sdkIds.push(snippetsConfigurationWithSdkIds.goSdk.sdkId);
                sdkRequests.push({
                    type: "go",
                    githubRepo: snippetsConfigurationWithSdkIds.goSdk.githubRepo,
                    version: snippetsConfigurationWithSdkIds.goSdk.version,
                });
            }
            if (snippetsConfigurationWithSdkIds.rubySdk != null) {
                sdkIds.push(snippetsConfigurationWithSdkIds.rubySdk.sdkId);
                sdkRequests.push({
                    type: "ruby",
                    gem: snippetsConfigurationWithSdkIds.rubySdk.gem,
                    version: snippetsConfigurationWithSdkIds.rubySdk.version,
                });
            }

            const snippetsBySdkId = await app.dao.snippets().loadAllSnippetsForSdkIds(sdkIds);
            const snippetTemplatesByEndpoint = await app.dao.snippetTemplates().loadSnippetTemplatesByEndpoint({
                orgId: req.body.orgId,
                apiId: req.body.apiId,
                sdkRequests,
                definition: req.body.definition,
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
