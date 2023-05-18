import { PrismaClient } from "@prisma/client";
import * as FernRegistryApiRead from "../generated/api/resources/api/resources/v1/resources/read";
import { ApiDoesNotExistError } from "../generated/api/resources/api/resources/v1/resources/read/errors/ApiDoesNotExistError";
import { ReadService } from "../generated/api/resources/api/resources/v1/resources/read/service/ReadService";
import * as FernSerializers from "../generated/serialization";
import { readBuffer } from "../serdeUtils";

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
            const parsedApiDefinition = await convertDbApiDefinitionToRead(apiDefinition.definition);
            return res.send(parsedApiDefinition);
        },
    });
}

export async function convertDbApiDefinitionToRead(buffer: Buffer): Promise<FernRegistryApiRead.ApiDefinition> {
    const apiDefinitionJson = readBuffer(buffer);
    return await FernSerializers.api.v1.read.ApiDefinition.parseOrThrow(apiDefinitionJson);
}
