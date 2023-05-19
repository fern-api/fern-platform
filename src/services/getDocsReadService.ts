import { PrismaClient } from "@prisma/client";
import { FernRegistry } from "../generated";
import { DomainNotRegisteredError } from "../generated/api/resources/docs/resources/v1/resources/read";
import { ReadService } from "../generated/api/resources/docs/resources/v1/resources/read/service/ReadService";
import * as FernSerializers from "../generated/serialization";
import { readBuffer } from "../serdeUtils";
import { convertDbApiDefinitionToRead } from "./getApiReadService";

export function getDocsReadService(prisma: PrismaClient): ReadService {
    return new ReadService({
        getDocsForDomainLegacy: async (req, res) => {
            return res.send(await getDocsForDomain({ domain: req.params.domain, prisma }));
        },
        getDocsForDomain: async (req, res) => {
            return res.send(await getDocsForDomain({ domain: req.body.domain, prisma }));
        },
    });
}

async function getDocsForDomain({
    domain,
    prisma,
}: {
    domain: string;
    prisma: PrismaClient;
}): Promise<Promise<Promise<FernRegistry.docs.v1.read.DocsDefinition>>> {
    const docs = await prisma.docs.findFirst({
        where: {
            url: domain,
        },
    });
    if (docs == null) {
        throw new DomainNotRegisteredError();
    }
    const docsDefinitionJson = readBuffer(docs.docsDefinition);
    const parsedDocsDbDefinition = await FernSerializers.docs.v1.read.DocsDefinitionDb.parseOrThrow(docsDefinitionJson);
    console.log(
        `Docs for ${domain} has stored api references ${Array.from(parsedDocsDbDefinition.referencedApis).join(", ")}`
    );
    const apiDefinitions = await prisma.apiDefinitionsV2.findMany({
        where: {
            apiDefinitionId: {
                in: Array.from(parsedDocsDbDefinition.referencedApis),
            },
        },
    });
    return {
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
    };
}
