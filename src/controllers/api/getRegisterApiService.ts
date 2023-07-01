import type { FdrApplication } from "src/app";
import { v4 as uuidv4 } from "uuid";
import { RegisterService } from "../../generated/api/resources/api/resources/v1/resources/register/service/RegisterService";
import { writeBuffer } from "../../util";
import { transformApiDefinitionForDb } from "./registerToDbConversion/transformApiDefinitionToDb";

export function getRegisterApiService(app: FdrApplication): RegisterService {
    return new RegisterService({
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
