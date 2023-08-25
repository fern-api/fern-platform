import type { FdrApplication } from "../../app";
import { FernRegistry } from "../../generated";
import * as FernRegistryApiRead from "../../generated/api/resources/api/resources/v1/resources/read";
import { ApiDoesNotExistError } from "../../generated/api/resources/api/resources/v1/resources/read/errors/ApiDoesNotExistError";
import { ReadService } from "../../generated/api/resources/api/resources/v1/resources/read/service/ReadService";
import { readBuffer } from "../../util";
import { transformApiDefinitionForReading } from "./dbToReadConversion/transformDbApiDefinitionToRead";

export function getReadApiService(app: FdrApplication): ReadService {
    return new ReadService({
        getApi: async (req, res) => {
            const apiDefinition = await app.services.db.prisma.apiDefinitionsV2.findFirst({
                where: {
                    apiDefinitionId: req.params.apiDefinitionId,
                },
            });
            if (apiDefinition == null) {
                throw new ApiDoesNotExistError();
            }
            const readApiDefinition = convertDbApiDefinitionToRead(apiDefinition.definition);
            return res.send(readApiDefinition);
        },
    });
}

export function convertDbApiDefinitionToRead(buffer: Buffer): FernRegistryApiRead.ApiDefinition {
    const apiDefinitionJson = readBuffer(buffer) as FernRegistry.api.v1.db.DbApiDefinition;
    return transformApiDefinitionForReading(apiDefinitionJson);
}
