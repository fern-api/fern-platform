import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import * as prisma from "@prisma/client";
import {
  Generator,
  GeneratorId,
  GeneratorLanguage,
  GeneratorScripts,
  GeneratorType,
  Script,
} from "../../api/generated/api/resources/generators";
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
  FdrAPI.EndpointPathLiteral,
  Record<FdrAPI.HttpMethod, APIV1Read.EndpointSnippetTemplates>
>;

export type SnippetTemplatesByEndpointIdentifier = Record<
  string,
  APIV1Read.EndpointSnippetTemplates
>;

export interface GeneratorsDao {
  upsertGenerator({ generator }: { generator: Generator }): Promise<void>;

  getGenerator({
    generatorId,
  }: {
    generatorId: GeneratorId;
  }): Promise<Generator | undefined>;

  getGeneratorByImage({
    image,
  }: {
    image: string;
  }): Promise<Generator | undefined>;

  listGenerators(): Promise<Generator[]>;

  deleteGenerator({ generatorId }: { generatorId: GeneratorId }): Promise<void>;
  deleteGenerators({
    generatorIds,
  }: {
    generatorIds: GeneratorId[];
  }): Promise<void>;
}

export class GeneratorsDaoImpl implements GeneratorsDao {
  constructor(private readonly prisma: prisma.PrismaClient) {}

  async getGeneratorByImage({
    image,
  }: {
    image: string;
  }): Promise<Generator | undefined> {
    return convertPrismaGenerator(
      await this.prisma.generator.findUnique({
        where: {
          dockerImage: image,
        },
      })
    );
  }
  async deleteGenerators({
    generatorIds,
  }: {
    generatorIds: string[];
  }): Promise<void> {
    await this.prisma.generator.deleteMany({
      where: {
        id: { in: generatorIds },
      },
    });
  }

  async deleteGenerator({
    generatorId,
  }: {
    generatorId: string;
  }): Promise<void> {
    await this.prisma.generator.delete({
      where: {
        id: generatorId,
      },
    });
  }

  async getGenerator({
    generatorId,
  }: {
    generatorId: GeneratorId;
  }): Promise<Generator | undefined> {
    return convertPrismaGenerator(
      await this.prisma.generator.findUnique({
        where: {
          id: generatorId,
        },
      })
    );
  }

  async listGenerators(): Promise<Generator[]> {
    const generators = await this.prisma.generator.findMany();

    return generators
      .map(convertPrismaGenerator)
      .filter((g): g is Generator => g != null);
  }

  async upsertGenerator({
    generator,
  }: {
    generator: Generator;
  }): Promise<void> {
    // We always just write over the previous entry here
    const data = {
      id: generator.id,
      displayName: generator.displayName,
      generatorType: writeBuffer(generator.generatorType),
      generatorLanguage: convertGeneratorLanguage(generator.generatorLanguage),
      dockerImage: generator.dockerImage,
      scripts: generator.scripts ? writeBuffer(generator.scripts) : undefined,
    };
    await this.prisma.generator.upsert({
      where: {
        id: generator.id,
      },
      update: data,
      create: data,
    });
  }
}

function convertGeneratorLanguage(
  generatorLanguage: GeneratorLanguage | undefined
): prisma.Language | undefined {
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

function convertPrismaLanguage(
  prismaLanguage: prisma.Language | null
): GeneratorLanguage | undefined {
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

function convertPrismaGenerator(
  generator: prisma.Generator | null
): Generator | undefined {
  return generator != null
    ? {
        id: FdrAPI.generators.GeneratorId(generator.id),
        displayName: generator.displayName,
        generatorType: readBuffer(generator.generatorType) as GeneratorType,
        generatorLanguage: convertPrismaLanguage(generator.generatorLanguage),
        dockerImage: generator.dockerImage,
        scripts: generator.scripts
          ? (readBuffer(generator.scripts) as GeneratorScripts)
          : undefined,
      }
    : undefined;
}
