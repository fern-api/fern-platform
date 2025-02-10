import { APIV1Write } from "@fern-api/fdr-sdk";
import { Language, Prisma, PrismaClient } from "@prisma/client";

import { LOGGER } from "../../app/FdrApplication";
import { SdkIdFactory } from "../snippets/SdkIdFactory";
import { SdkId } from "../types";

type PrismaTransaction = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never>,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface SdkIdForPackage {
  typescriptSdk?: APIV1Write.TypescriptPackage & { sdkId: string };
  pythonSdk?: APIV1Write.PythonPackage & { sdkId: string };
  goSdk?: APIV1Write.GoModule & { sdkId: string };
  rubySdk?: APIV1Write.RubyGem & { sdkId: string };
  javaSdk?: APIV1Write.JavaCoordinate & { sdkId: string };
}

interface SdkPackageRequest {
  sdkPackage: string;
  language: Language;
  version?: string;
}

export interface SdkPackage extends SdkPackageRequest {
  id: string;
  sdk: Buffer;
}

export interface SdkDao {
  createSdk(sdk: SdkPackage, tx?: PrismaClient): Promise<void>;

  createSdkIfNotExists(
    sdk: SdkPackage,
    tx?: PrismaClient,
    overwrite?: boolean
  ): Promise<void>;

  getSdkIdsForPackages(
    snippetConfig: APIV1Write.SnippetsConfig
  ): Promise<SdkIdForPackage>;

  getSdkIdForPackage({
    sdkPackage,
    language,
    version,
  }: SdkPackageRequest): Promise<SdkId | undefined>;
}

export class SdkDaoImpl implements SdkDao {
  constructor(private readonly prisma: PrismaClient) {}

  public async createManySdks(
    sdks: SdkPackage[],
    tx?: PrismaTransaction
  ): Promise<void> {
    await (tx ?? this.prisma).sdk.createMany({
      data: sdks.map((sdk) => ({
        id: sdk.id,
        package: sdk.sdkPackage,
        language: sdk.language,
        version: sdk.version,
        sdk: sdk.sdk,
      })),
      skipDuplicates: true,
    });
  }

  public async createSdk(
    sdk: SdkPackage,
    tx?: PrismaTransaction
  ): Promise<void> {
    await (tx ?? this.prisma).sdk.create({
      data: {
        id: sdk.id,
        package: sdk.sdkPackage,
        language: sdk.language,
        version: sdk.version,
        sdk: sdk.sdk,
      },
    });
  }

  public async createSdkIfNotExists(
    sdk: SdkPackage,
    tx?: PrismaTransaction,
    overwrite?: boolean
  ): Promise<void> {
    const dbSdk = await (tx ?? this.prisma).sdk.findUnique({
      where: {
        id: sdk.id,
      },
    });
    if (dbSdk == null || overwrite === true) {
      // Overwrite the SDK and all of its snippets that already exist.
      if (dbSdk !== null && overwrite === true) {
        await (tx ?? this.prisma).sdk.delete({
          where: {
            id: sdk.id,
          },
        });
      }
      await this.createSdk(sdk, tx);
    }
  }

  public async getSdkIdsForPackages(
    snippetConfig: APIV1Write.SnippetsConfig
  ): Promise<SdkIdForPackage> {
    const result: SdkIdForPackage = {};
    if (snippetConfig.typescriptSdk != null) {
      const sdkId = await this.getSdkIdForPackage({
        sdkPackage: snippetConfig.typescriptSdk.package,
        language: Language.TYPESCRIPT,
        version: snippetConfig.typescriptSdk.version,
      });
      if (sdkId != null) {
        result.typescriptSdk = { ...snippetConfig.typescriptSdk, sdkId };
      }
    }
    if (snippetConfig.pythonSdk != null) {
      const sdkId = await this.getSdkIdForPackage({
        sdkPackage: snippetConfig.pythonSdk.package,
        language: Language.PYTHON,
        version: snippetConfig.pythonSdk.version,
      });
      if (sdkId != null) {
        result.pythonSdk = { ...snippetConfig.pythonSdk, sdkId };
      }
    }
    if (snippetConfig.javaSdk != null) {
      const sdkId = await this.getSdkIdForPackage({
        sdkPackage: snippetConfig.javaSdk.coordinate,
        language: Language.JAVA,
        version: snippetConfig.javaSdk.version,
      });
      if (sdkId != null) {
        result.javaSdk = { ...snippetConfig.javaSdk, sdkId };
      }
    }
    if (snippetConfig.goSdk != null) {
      const sdkId = await this.getSdkIdForPackage({
        sdkPackage: snippetConfig.goSdk.githubRepo,
        language: Language.GO,
        version: snippetConfig.goSdk.version,
      });
      if (sdkId != null) {
        result.goSdk = { ...snippetConfig.goSdk, sdkId };
      }
    }
    if (snippetConfig.rubySdk != null) {
      const sdkId = await this.getSdkIdForPackage({
        sdkPackage: snippetConfig.rubySdk.gem,
        language: Language.RUBY,
        version: snippetConfig.rubySdk.version,
      });
      if (sdkId != null) {
        result.rubySdk = { ...snippetConfig.rubySdk, sdkId };
      }
    }

    return result;
  }

  public async getSdkIdForPackage({
    sdkPackage,
    language,
    version,
  }: SdkPackageRequest): Promise<string | undefined> {
    let id: string | undefined;
    if (version != null) {
      switch (language) {
        case Language.TYPESCRIPT:
          id = SdkIdFactory.fromTypescript({ package: sdkPackage, version });
          break;
        case Language.PYTHON:
          id = SdkIdFactory.fromPython({ package: sdkPackage, version });
          break;
        case Language.GO:
          id = SdkIdFactory.fromGo({ githubRepo: sdkPackage, version });
          break;
        case Language.RUBY:
          id = SdkIdFactory.fromRuby({ gem: sdkPackage, version });
          break;
        default:
          break;
      }
      if (id != null) {
        return id;
      }
    }

    // Get all SDK rows ordered by creation date
    const sdkRows = await this.prisma.sdk.findMany({
      select: {
        id: true,
      },
      where: {
        package: sdkPackage,
        language,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Find first SDK that has snippets
    for (const sdkRow of sdkRows) {
      const hasSnippets = await this.prisma.snippet.findFirst({
        where: {
          sdkId: sdkRow.id,
        },
      });

      if (hasSnippets) {
        return sdkRow?.id;
      }
    }

    // If no SDKs have snippets, return the most recent one
    const sdkRow = sdkRows[0];

    LOGGER.info(
      `Looking for latest registered SDK ${sdkPackage} and found id ${sdkRow?.id}`
    );
    return sdkRow?.id;
  }
}
