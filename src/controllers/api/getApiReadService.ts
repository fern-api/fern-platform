import { APIV1Db, APIV1Read, APIV1ReadService } from "../../api";
import type { FdrApplication } from "../../app";
import { readBuffer } from "../../util";
import { transformApiDefinitionForReading } from "../../converters/read/convertAPIDefinitionToRead";

export function getReadApiService(app: FdrApplication): APIV1ReadService {
    return new APIV1ReadService({
        getApi: async (req, res) => {
            const apiDefinition = await app.services.db.prisma.apiDefinitionsV2.findFirst({
                where: {
                    apiDefinitionId: req.params.apiDefinitionId,
                },
            });
            if (apiDefinition == null) {
                throw new APIV1Read.ApiDoesNotExistError();
            }
            const readApiDefinition = convertDbApiDefinitionToRead(apiDefinition.definition);
            return res.send(readApiDefinition);
        },
    });
}

export function convertDbApiDefinitionToRead(buffer: Buffer): APIV1Read.ApiDefinition {
    const apiDefinitionJson = readBuffer(buffer) as APIV1Db.DbApiDefinition;
    return transformApiDefinitionForReading(apiDefinitionJson);
}
