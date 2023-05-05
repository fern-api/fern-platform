import { PrismaClient } from "@prisma/client";
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
            const apiDefinitionJson = readBuffer(apiDefinition.definition);
            const parsedApiDefinition = await FernSerializers.api.v1.register.ApiDefinition.parseOrThrow(
                apiDefinitionJson
            );
            return res.send({
                id: req.params.apiDefinitionId,
                ...parsedApiDefinition,
            });
        },
    });
}
