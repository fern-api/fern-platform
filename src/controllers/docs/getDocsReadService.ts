import type { DocsV2 } from "@prisma/client";
import type { FdrApplication } from "../../app";
import { FernRegistry } from "../../generated";
import { DomainNotRegisteredError } from "../../generated/api/resources/docs/resources/v1/resources/read";
import { ReadService } from "../../generated/api/resources/docs/resources/v1/resources/read/service/ReadService";
import { readBuffer } from "../../util";
import { convertDbApiDefinitionToRead } from "../api/getApiReadService";

export function getDocsReadService(app: FdrApplication): ReadService {
    return new ReadService({
        getDocsForDomainLegacy: async (req, res) => {
            const definition = await getDocsForDomain({ app, domain: req.params.domain });
            return res.send(definition);
        },
        getDocsForDomain: async (req, res) => {
            const definition = await getDocsForDomain({ app, domain: req.body.domain });
            return res.send(definition);
        },
    });
}

export async function getDocsForDomain({
    app,
    domain,
}: {
    app: FdrApplication;
    domain: string;
}): Promise<FernRegistry.docs.v1.read.DocsDefinition> {
    console.debug(__filename, "Finding first docs for domain", domain);

    const [docs, docsV2] = await Promise.all([
        app.services.db.prisma.docs.findFirst({
            where: {
                url: domain,
            },
        }),
        app.services.db.prisma.docsV2.findFirst({
            where: {
                domain,
            },
        }),
    ]);

    console.debug(__filename, "Found first docs for domain", domain);
    if (!docs) {
        throw new DomainNotRegisteredError();
    }
    console.debug(__filename, "Reading buffer for domain", domain);
    const docsDefinitionJson = readBuffer(docs.docsDefinition);
    console.debug(__filename, "Read buffer for domain", domain);
    console.debug(__filename, "Parsing docs definition for domain", domain);
    const docsDbDefinition = migrateDocsDbDefinition(docsDefinitionJson);
    console.debug(__filename, "Parse docs definition for domain", domain);

    return getDocsDefinition({ app, docsDbDefinition, docsV2 });
}

export async function getDocsDefinition({
    app,
    docsDbDefinition,
    docsV2,
}: {
    app: FdrApplication;
    docsDbDefinition: FernRegistry.docs.v1.db.DocsDefinitionDb;
    docsV2: DocsV2 | null;
}): Promise<FernRegistry.docs.v1.read.DocsDefinition> {
    const apiDefinitions = await app.services.db.prisma.apiDefinitionsV2.findMany({
        where: {
            apiDefinitionId: {
                in: Array.from(docsDbDefinition.referencedApis),
            },
        },
    });
    return {
        algoliaSearchIndex: docsV2?.algoliaIndex ?? undefined,
        config: {
            navigation: docsDbDefinition.config.navigation,
            logo: docsDbDefinition.config.logo,
            colors: docsDbDefinition.config.colors,
            navbarLinks: docsDbDefinition.config.navbarLinks ?? [],
            title: docsDbDefinition.config.title,
            favicon: docsDbDefinition.config.favicon,
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
                Object.entries(docsDbDefinition.files).map(async ([fileId, fileDbInfo]) => {
                    console.debug(__filename, "Gettings S3 download URL", fileId);
                    const s3DownloadUrl = await app.services.s3.getPresignedDownloadUrl({ key: fileDbInfo.s3Key });
                    console.debug(__filename, "Gettings S3 download URL", fileId);
                    return [fileId, s3DownloadUrl];
                })
            )
        ),
        pages: docsDbDefinition.pages,
    };
}

export function migrateDocsDbDefinition(dbValue: unknown): FernRegistry.docs.v1.db.DocsDefinitionDb {
    return {
        // default to v1, but this will be overwritten if dbValue has "type" defined
        type: "v1",
        ...(dbValue as object),
    } as FernRegistry.docs.v1.db.DocsDefinitionDb;
}
