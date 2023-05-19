import { PrismaClient } from "@prisma/client";
import { AuthUtils } from "../AuthUtils";
import { WriteService } from "../generated/api/resources/docs/resources/v1/resources/write/service/WriteService";
import * as FernSerializers from "../generated/serialization";
import { writeBuffer } from "../serdeUtils";
import { transformWriteDocsDefinitionToDb } from "./transformDocsDefinitionToDb";

export function getDocsWriteService(prisma: PrismaClient, authUtils: AuthUtils): WriteService {
    return new WriteService({
        registerDocs: async (req, res) => {
            await authUtils.checkUserBelongsToOrg({ authHeader: req.headers.authorization, orgId: req.body.orgId });
            const dbDocsDefinition = transformWriteDocsDefinitionToDb(req.body.docsDefinition);
            console.log(
                `Docs for ${req.body.orgId} has references to apis ${Array.from(dbDocsDefinition.referencedApis).join(
                    ", "
                )}`
            );
            const jsonDocsDefinition = await FernSerializers.docs.v1.read.DocsDefinitionDb.jsonOrThrow(
                dbDocsDefinition
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
