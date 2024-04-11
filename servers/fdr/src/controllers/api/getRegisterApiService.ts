import { SDKSnippetHolder, convertAPIDefinitionToDb } from "@fern-api/fdr-sdk";
import { v4 as uuidv4 } from "uuid";
import { APIV1WriteService } from "../../api";
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
            const snippetsConfigurationWithSdkIds = await app.dao
                .sdks()
                .getLatestSdkIdsForPackages(snippetsConfiguration);
            const sdkIds = [];
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
            const apiDefinitionId = uuidv4();
            const snippetHolder = new SDKSnippetHolder({
                snippetsBySdkId,
                snippetsConfigWithSdkId: snippetsConfigurationWithSdkIds,
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
