import { v4 as uuidv4 } from "uuid";
import { APIV1WriteService } from "../../api";
import type { FdrApplication } from "../../app";
import { transformApiDefinitionForDb } from "../../converters/db/convertAPIDefinitionToDb";
import { writeBuffer } from "../../util";

export function getRegisterApiService(app: FdrApplication): APIV1WriteService {
    return new APIV1WriteService({
        registerApiDefinition: async (req, res) => {
            await app.services.auth.checkUserBelongsToOrg({
                authHeader: req.headers.authorization,
                orgId: req.body.orgId,
            });
            const apiDefinitionId = uuidv4();
            const transformedApiDefinition = transformApiDefinitionForDb(req.body.definition, apiDefinitionId);
            await app.services.db.prisma.apiDefinitionsV2.create({
                data: {
                    apiDefinitionId,
                    apiName: req.body.apiId,
                    orgId: req.body.orgId,
                    definition: writeBuffer(transformedApiDefinition),
                },
            });
            return res.send({
                apiDefinitionId,
            });
        },
    });
}
