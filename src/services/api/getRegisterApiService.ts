import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { AuthUtils } from "../../AuthUtils";
import { RegisterService } from "../../generated/api/resources/api/resources/v1/resources/register/service/RegisterService";
import { writeBuffer } from "../../serdeUtils";
import { transformApiDefinitionForDb } from "./registerToDbConversion/transformApiDefinitionToDb";

export function getRegisterApiService(prisma: PrismaClient, authUtils: AuthUtils): RegisterService {
    return new RegisterService({
        registerApiDefinition: async (req, res) => {
            await authUtils.checkUserBelongsToOrg({ authHeader: req.headers.authorization, orgId: req.body.orgId });
            const apiDefinitionId = uuidv4();
            const transformedApiDefinition = transformApiDefinitionForDb(req.body.definition, apiDefinitionId);
            await prisma.apiDefinitionsV2.create({
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
