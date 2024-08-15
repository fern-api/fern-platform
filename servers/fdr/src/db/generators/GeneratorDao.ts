import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import * as prisma from "@prisma/client";
import { Generator, GeneratorId, GeneratorLanguage, GeneratorType } from "../../api/generated/api/resources/generators";
import { assertNever, readBuffer, writeBuffer } from "../../util";

export interface LoadSnippetAPIRequest {
    orgId: string;
    apiName: string;
}

export interface LoadSnippetAPIsRequest {
    orgIds: string[];
    apiName: string | undefined;
}

export type SnippetTemplatesByEndpoint = Record<
    FdrAPI.EndpointPath,
    Record<FdrAPI.EndpointMethod, APIV1Read.EndpointSnippetTemplates>
>;

export type SnippetTemplatesByEndpointIdentifier = Record<string, APIV1Read.EndpointSnippetTemplates>;

export interface GeneratorsDao {
    upsertGenerator({ generator }: { generator: Generator }): Promise<void>;

    getGenerator({ generatorId }: { generatorId: GeneratorId }): Promise<Generator | undefined>;

    listGenerators(): Promise<Generator[]>;
}

export class GeneratorsDaoImpl implements GeneratorsDao {
    constructor(private readonly prisma: prisma.PrismaClient) {}
    async getGenerator({ generatorId }: { generatorId: GeneratorId }): Promise<Generator | undefined> {
        return await convertPrismaGenerator(
            await this.prisma.generator.findUnique({
                where: {
                    id: generatorId,
                },
            }),
        );
    }
    async listGenerators(): Promise<Generator[]> {
        const generators = await this.prisma.generator.findMany();

        return (await Promise.all(generators.map(convertPrismaGenerator))).filter((g): g is Generator => g != null);
    }

    async upsertGenerator({ generator }: { generator: Generator }): Promise<void> {
        // We always just write over the previous entry here
        await this.prisma.generator.create({
            data: {
                id: generator.id,
                generatorType: writeBuffer(generator.generator_type),
                generatorLanguage: convertGeneratorLanguage(generator.generator_language),
                dockerImage: generator.docker_image,
            },
        });
    }
}

function convertGeneratorLanguage(generatorLanguage: GeneratorLanguage | undefined): prisma.Language | undefined {
    if (generatorLanguage == null) {
        return undefined;
    }
    switch (generatorLanguage) {
        case GeneratorLanguage.Python:
            return prisma.Language.PYTHON;
        case GeneratorLanguage.Typescript:
            return prisma.Language.TYPESCRIPT;
        case GeneratorLanguage.Java:
            return prisma.Language.JAVA;
        case GeneratorLanguage.Go:
            return prisma.Language.GO;
        case GeneratorLanguage.Csharp:
            return prisma.Language.CSHARP;
        case GeneratorLanguage.Ruby:
            return prisma.Language.RUBY;
        case GeneratorLanguage.Php:
            return prisma.Language.PHP;
        case GeneratorLanguage.Swift:
            return prisma.Language.SWIFT;
        case GeneratorLanguage.Rust:
            return prisma.Language.RUST;
        default:
            assertNever(generatorLanguage);
    }
}

function convertPrismaLanguage(prismaLanguage: prisma.Language | null): GeneratorLanguage | undefined {
    if (prismaLanguage == null) {
        return undefined;
    }
    switch (prismaLanguage) {
        case prisma.Language.PYTHON:
            return GeneratorLanguage.Python;
        case prisma.Language.TYPESCRIPT:
            return GeneratorLanguage.Typescript;
        case prisma.Language.JAVA:
            return GeneratorLanguage.Java;
        case prisma.Language.GO:
            return GeneratorLanguage.Go;
        case prisma.Language.CSHARP:
            return GeneratorLanguage.Csharp;
        case prisma.Language.RUBY:
            return GeneratorLanguage.Ruby;
        case prisma.Language.PHP:
            return GeneratorLanguage.Php;
        case prisma.Language.SWIFT:
            return GeneratorLanguage.Swift;
        case prisma.Language.RUST:
            return GeneratorLanguage.Rust;
        default:
            assertNever(prismaLanguage);
    }
}

async function convertPrismaGenerator(generator: prisma.Generator | null): Promise<Generator | undefined> {
    return generator != null
        ? {
              id: generator.id,
              generator_type: readBuffer(generator.generatorType) as GeneratorType,
              generator_language: convertPrismaLanguage(generator.generatorLanguage),
              docker_image: generator.dockerImage,
          }
        : undefined;
}
