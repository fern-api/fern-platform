import { PrismaClient } from "@prisma/client";
import { FernRegistry } from "../../generated";
import * as FernRegistryApiRead from "../../generated/api/resources/api/resources/v1/resources/read";
import { ApiDoesNotExistError } from "../../generated/api/resources/api/resources/v1/resources/read/errors/ApiDoesNotExistError";
import { ReadService } from "../../generated/api/resources/api/resources/v1/resources/read/service/ReadService";
import { readBuffer } from "../../serdeUtils";
import { transformApiDefinitionForReading } from "./dbToReadConversion/transformDbApiDefinitionToRead";

export function getReadApiService(prisma: PrismaClient): ReadService {
    return new ReadService({
        getApi: async (req, res) => {
            const apiDefinition = await prisma.apiDefinitionsV2.findFirst({
                where: {
                    apiDefinitionId: req.params.apiDefinitionId,
                },
            });
            if (apiDefinition == null) {
                throw new ApiDoesNotExistError();
            }
            const readApiDefinition = await convertDbApiDefinitionToRead(apiDefinition.definition);
            return res.send(readApiDefinition);
        },
    });
}

export async function convertDbApiDefinitionToRead(buffer: Buffer): Promise<FernRegistryApiRead.ApiDefinition> {
    console.debug(__filename, "Reading buffer to convert db api definition to read");
    const apiDefinitionJson = readBuffer(buffer) as FernRegistry.api.v1.db.DbApiDefinition;
    console.debug(__filename, "Read buffer to convert db api definition to read");
    return transformApiDefinitionForReading(apiDefinitionJson);
}
