import { PrismaClient } from "@prisma/client";
import { DomainNotRegisteredError } from "../generated/api/resources/docs/resources/v1/resources/read";
import { ReadService } from "../generated/api/resources/docs/resources/v1/resources/read/service/ReadService";
import * as FernSerializers from "../generated/serialization";
import { readBuffer } from "../serdeUtils";
import { convertDbApiDefinitionToRead } from "./getApiReadService";

export function getDocsReadService(prisma: PrismaClient): ReadService {
    return new ReadService({
        getDocsForDomain: async (req, res) => {
            const docs = await prisma.docs.findFirst({
                where: {
                    url: req.params.domain,
                },
            });
            if (docs == null) {
                throw new DomainNotRegisteredError();
            }
            const docsDefinitionJson = readBuffer(docs.docsDefinition);
            const parsedDocsDbDefinition = await FernSerializers.docs.v1.read.DocsDefinitionDb.parseOrThrow(
                docsDefinitionJson
            );
            const apiDefinitions = await prisma.apiDefinitionsV2.findMany({
                where: {
                    apiDefinitionId: {
                        in: [...parsedDocsDbDefinition.referencedApis],
                    },
                },
            });

            return res.send({
                config: parsedDocsDbDefinition.config,
                apis: Object.fromEntries(
                    await Promise.all(
                        apiDefinitions.map(async (apiDefinition) => {
                            const parsedApiDefinition = await convertDbApiDefinitionToRead(apiDefinition.definition);
                            return [apiDefinition.apiDefinitionId, parsedApiDefinition];
                        })
                    )
                ),
                pages: parsedDocsDbDefinition.pages,
            });
        },
    });
}
