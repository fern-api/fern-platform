import { PrismaClient } from "@prisma/client";
import { S3Utils } from "../../S3Utils";
import { FernRegistry } from "../../generated";
import { DomainNotRegisteredError } from "../../generated/api/resources/docs/resources/v1/resources/read";
import { ReadService } from "../../generated/api/resources/docs/resources/v1/resources/read/service/ReadService";
import * as FernSerializers from "../../generated/serialization";
import { readBuffer } from "../../serdeUtils";
import { convertDbApiDefinitionToRead } from "../api/getApiReadService";

export function getDocsReadService(prisma: PrismaClient, s3Utils: S3Utils): ReadService {
    return new ReadService({
        getDocsForDomainLegacy: async (req, res) => {
            return res.send(await getDocsForDomain({ domain: req.params.domain, prisma, s3Utils }));
        },
        getDocsForDomain: async (req, res) => {
            return res.send(await getDocsForDomain({ domain: req.body.domain, prisma, s3Utils }));
        },
    });
}

export async function getDocsForDomain({
    domain,
    prisma,
    s3Utils,
}: {
    domain: string;
    prisma: PrismaClient;
    s3Utils: S3Utils;
}): Promise<FernRegistry.docs.v1.read.DocsDefinition> {
    const docs = await prisma.docs.findFirst({
        where: {
            url: domain,
        },
    });
    if (docs == null) {
        throw new DomainNotRegisteredError();
    }
    const docsDefinitionJson = readBuffer(docs.docsDefinition);
    const parsedDocsDbDefinition = await parseDocsDbDefinition(docsDefinitionJson);

    return getDocsDefinition({ parsedDocsDbDefinition, prisma, s3Utils });
}

export async function getDocsDefinition({
    parsedDocsDbDefinition,
    prisma,
    s3Utils,
}: {
    parsedDocsDbDefinition: FernRegistry.docs.v1.db.DocsDefinitionDb;
    prisma: PrismaClient;
    s3Utils: S3Utils;
}): Promise<FernRegistry.docs.v1.read.DocsDefinition> {
    const apiDefinitions = await prisma.apiDefinitionsV2.findMany({
        where: {
            apiDefinitionId: {
                in: Array.from(parsedDocsDbDefinition.referencedApis),
            },
        },
    });
    return {
        config: {
            navigation: parsedDocsDbDefinition.config.navigation,
            logo: parsedDocsDbDefinition.config.logo,
            colors: parsedDocsDbDefinition.config.colors,
            navbarLinks: parsedDocsDbDefinition.config.navbarLinks ?? [],
            title: parsedDocsDbDefinition.config.title,
            favicon: parsedDocsDbDefinition.config.favicon,
        },
        apis: Object.fromEntries(
            await Promise.all(
                apiDefinitions.map(async (apiDefinition) => {
                    const parsedApiDefinition = await convertDbApiDefinitionToRead(apiDefinition.definition);
                    return [apiDefinition.apiDefinitionId, parsedApiDefinition];
                })
            )
        ),
        files: Object.fromEntries(
            await Promise.all(
                Object.entries(parsedDocsDbDefinition.files).map(async ([fileId, fileDbInfo]) => {
                    const s3DownloadUrl = await s3Utils.getPresignedDownloadUrl({ key: fileDbInfo.s3Key });
                    return [fileId, s3DownloadUrl];
                })
            )
        ),
        pages: parsedDocsDbDefinition.pages,
    };
}

export function parseDocsDbDefinition(dbValue: unknown): Promise<FernRegistry.docs.v1.db.DocsDefinitionDb> {
    if (dbValue != null && typeof dbValue === "object" && !("type" in dbValue)) {
        return FernSerializers.docs.v1.db.DocsDefinitionDb.parseOrThrow({
            ...dbValue,
            type: "v1",
        });
    }
    return FernSerializers.docs.v1.db.DocsDefinitionDb.parseOrThrow(dbValue);
}
