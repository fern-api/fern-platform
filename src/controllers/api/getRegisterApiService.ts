import { v4 as uuidv4 } from "uuid";
import { APIV1WriteService } from "../../api";
import type { FdrApplication } from "../../app";
import { transformApiDefinitionForDb } from "../../converters/db/convertAPIDefinitionToDb";
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
            const apiDefinitionId = uuidv4();
            const transformedApiDefinition = transformApiDefinitionForDb(req.body.definition, apiDefinitionId);
            app.logger.debug(
                `Creating API Definition in database with name=${req.body.apiId} for org ${req.body.orgId}`,
                REGISTER_API_DEFINITION_META
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
