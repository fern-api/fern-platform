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
    console.debug(__filename, "Finding first docs for domain", domain);
    const docs = await prisma.docs.findFirst({
        where: {
            url: domain,
        },
    });
    console.debug(__filename, "Found first docs for domain", domain);
    if (docs == null) {
        throw new DomainNotRegisteredError();
    }
    console.debug(__filename, "Reading buffer for domain", domain);
    const docsDefinitionJson = readBuffer(docs.docsDefinition);
    console.debug(__filename, "Read buffer for domain", domain);
    console.debug(__filename, "Parsing docs definition for domain", domain);
    const parsedDocsDbDefinition = await parseDocsDbDefinition(docsDefinitionJson);
    console.debug(__filename, "Parse docs definition for domain", domain);

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
    console.debug(__filename, "Finding api definitions");
    const apiDefinitions = await prisma.apiDefinitionsV2.findMany({
        where: {
            apiDefinitionId: {
                in: Array.from(parsedDocsDbDefinition.referencedApis),
            },
        },
    });
    console.debug(__filename, "Found api definitions");
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
                    console.debug(__filename, "Converting API Definition to 'read'", apiDefinition.apiDefinitionId);
                    const parsedApiDefinition = await convertDbApiDefinitionToRead(apiDefinition.definition);
                    console.debug(__filename, "Converted API Definition to 'read'", apiDefinition.apiDefinitionId);
                    return [apiDefinition.apiDefinitionId, parsedApiDefinition];
                })
            )
        ),
        files: Object.fromEntries(
            await Promise.all(
                Object.entries(parsedDocsDbDefinition.files).map(async ([fileId, fileDbInfo]) => {
                    console.debug(__filename, "Gettings S3 download URL", fileId);
                    const s3DownloadUrl = await s3Utils.getPresignedDownloadUrl({ key: fileDbInfo.s3Key });
                    console.debug(__filename, "Gettings S3 download URL", fileId);
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
