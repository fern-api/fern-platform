import { PrismaClient } from "@prisma/client";
import { AuthUtils } from "../AuthUtils";
import { DomainNotRegisteredError } from "../generated/api/resources/docs/resources/v1";
import { V1Service } from "../generated/api/resources/docs/resources/v1/service/V1Service";
import * as FernSerializers from "../generated/serialization";
import { readBuffer, writeBuffer } from "../serdeUtils";

export function getDocsService(prisma: PrismaClient, authUtils: AuthUtils): V1Service {
    return new V1Service({
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
            const parsedDocsDefinition = await FernSerializers.docs.v1.DocsDefinition.parseOrThrow(docsDefinitionJson);
            return res.send(parsedDocsDefinition);
        },
        registerDocs: async (req, res) => {
            await authUtils.checkUserBelongsToOrg({ authHeader: req.headers.authorization, orgId: req.body.orgId });
            const jsonDocsDefinition = await FernSerializers.docs.v1.DocsDefinition.jsonOrThrow(
                req.body.docsDefinition
            );
            await prisma.docs.upsert({
                create: {
                    url: req.body.domain,
                    docsDefinition: writeBuffer(jsonDocsDefinition),
                },
                update: {
                    docsDefinition: writeBuffer(jsonDocsDefinition),
                },
                where: {
                    url: req.body.domain,
                },
            });
            return res.send();
        },
    });
}
