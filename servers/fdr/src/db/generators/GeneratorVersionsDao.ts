import * as prisma from "@prisma/client";

import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";

import {
  ChangelogEntry,
  ChangelogResponse,
  GeneratorId,
  GeneratorRelease,
  GeneratorReleaseRequest,
  GetChangelogRequest,
  GetChangelogResponse,
  GetLatestGeneratorReleaseRequest,
  ListGeneratorReleasesResponse,
  Yank,
} from "../../api/generated/api/resources/generators";
import { readBuffer, writeBuffer } from "../../util";
import {
  convertGeneratorReleaseType,
  convertPrismaReleaseType,
  getPrereleaseType,
  parseSemverOrThrow,
} from "./daoUtils";
import { noncifySemanticVersion } from "./noncifySemanticVersion";

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

export interface GeneratorVersionsDao {
  getLatestGeneratorRelease({
    getLatestGeneratorReleaseRequest,
  }: {
    getLatestGeneratorReleaseRequest: GetLatestGeneratorReleaseRequest;
  }): Promise<GeneratorRelease | undefined>;

  getChangelog({
    generator,
    versionRanges,
  }: {
    generator: GeneratorId;
    versionRanges: GetChangelogRequest;
  }): Promise<GetChangelogResponse>;

  upsertGeneratorRelease({
    generatorRelease,
  }: {
    generatorRelease: GeneratorReleaseRequest;
  }): Promise<void>;

  getGeneratorRelease({
    generator,
    version,
  }: {
    generator: GeneratorId;
    version: string;
  }): Promise<GeneratorRelease | undefined>;

  listGeneratorReleases({
    generator,
    page,
    pageSize,
  }: {
    generator: GeneratorId;
    page?: number;
    pageSize?: number;
  }): Promise<ListGeneratorReleasesResponse>;
}

export class GeneratorVersionsDaoImpl implements GeneratorVersionsDao {
  constructor(private readonly prisma: prisma.PrismaClient) {}

  async upsertGeneratorRelease({
    generatorRelease,
  }: {
    generatorRelease: GeneratorReleaseRequest;
  }): Promise<void> {
    const parsedVersion = parseSemverOrThrow(generatorRelease.version);

    const releaseType = convertGeneratorReleaseType(
      getPrereleaseType(generatorRelease.version)
    );
    const data = {
      version: generatorRelease.version,
      generatorId: generatorRelease.generatorId,
      irVersion: generatorRelease.irVersion,
      major: parsedVersion.major,
      minor: parsedVersion.minor,
      patch: parsedVersion.patch,
      isYanked:
        generatorRelease.isYanked != null
          ? writeBuffer(generatorRelease.isYanked)
          : undefined,
      changelogEntry:
        generatorRelease.changelogEntry != null
          ? writeBuffer(generatorRelease.changelogEntry)
          : undefined,
      migration:
        generatorRelease.migration != null
          ? writeBuffer(generatorRelease.migration)
          : undefined,
      customConfigSchema: generatorRelease.customConfigSchema,
      releaseType,
      nonce: noncifySemanticVersion(generatorRelease.version),
      createdAt:
        generatorRelease.createdAt != null
          ? new Date(generatorRelease.createdAt)
          : undefined,
      tags: generatorRelease.tags,
    };
    await this.prisma.generatorRelease.upsert({
      where: {
        generatorId_version: {
          generatorId: generatorRelease.generatorId,
          version: generatorRelease.version,
        },
      },
      create: data,
      update: data,
    });
  }

  async getGeneratorRelease({
    generator,
    version,
  }: {
    generator: string;
    version: string;
  }): Promise<GeneratorRelease | undefined> {
    const maybeRelease = await this.prisma.generatorRelease.findUnique({
      where: {
        generatorId_version: {
          generatorId: generator,
          version,
        },
      },
    });
    return maybeRelease != null
      ? convertPrismaGeneratorRelease(maybeRelease)
      : undefined;
  }

  async listGeneratorReleases({
    generator,
    page = 0,
    pageSize = 20,
  }: {
    generator: GeneratorId;
    page?: number;
    pageSize?: number;
  }): Promise<ListGeneratorReleasesResponse> {
    const releases = await this.prisma.generatorRelease.findMany({
      where: {
        generatorId: generator,
      },
      skip: page * pageSize,
      take: pageSize,
      orderBy: [
        {
          nonce: "desc",
        },
      ],
    });

    return {
      generatorReleases: releases
        .map(convertPrismaGeneratorRelease)
        .filter((g): g is GeneratorRelease => g != null),
    };
  }

  async getLatestGeneratorRelease({
    getLatestGeneratorReleaseRequest,
  }: {
    getLatestGeneratorReleaseRequest: GetLatestGeneratorReleaseRequest;
  }): Promise<GeneratorRelease | undefined> {
    const releaseTypes =
      getLatestGeneratorReleaseRequest.releaseTypes != null
        ? getLatestGeneratorReleaseRequest.releaseTypes.map(
            convertGeneratorReleaseType
          )
        : [prisma.ReleaseType.ga];

    const release = await this.prisma.$transaction(async (prisma) => {
      // If an IR version is provided outright, we can use that to filter the generators
      let irVersion = getLatestGeneratorReleaseRequest.irVersion;

      // If a CLI version is provided, this takes precedence over a provided IR version if both
      // are provided. When a CLI version is provided we need to find the IR version that corresponds to it
      // to filter the generators to compatible versions.
      if (getLatestGeneratorReleaseRequest.cliVersion != null) {
        const cliRelease = await prisma.cliRelease.findUnique({
          where: {
            version: getLatestGeneratorReleaseRequest.cliVersion,
          },
        });

        if (cliRelease != null) {
          irVersion = cliRelease.irVersion;
        }
      }

      // The above sets the filter `irVersion`, and that's all.
      return await prisma.generatorRelease.findFirst({
        where: {
          generatorId: getLatestGeneratorReleaseRequest.generator,
          releaseType: { in: releaseTypes },
          major: getLatestGeneratorReleaseRequest.generatorMajorVersion,
          irVersion: { lte: irVersion },
          isYanked: null,
        },
        orderBy: [
          {
            nonce: "desc",
          },
        ],
      });
    });

    return convertPrismaGeneratorRelease(release);
  }

  async getChangelog({
    generator,
    versionRanges,
  }: {
    generator: GeneratorId;
    versionRanges: GetChangelogRequest;
  }): Promise<GetChangelogResponse> {
    const releases = await this.prisma.generatorRelease.findMany({
      where: {
        generatorId: generator,
        nonce: {
          gte:
            versionRanges.fromVersion.type == "inclusive"
              ? noncifySemanticVersion(versionRanges.fromVersion.value)
              : undefined,
          gt:
            versionRanges.fromVersion.type == "exclusive"
              ? noncifySemanticVersion(versionRanges.fromVersion.value)
              : undefined,
          lte:
            versionRanges.toVersion.type == "inclusive"
              ? noncifySemanticVersion(versionRanges.toVersion.value)
              : undefined,
          lt:
            versionRanges.toVersion.type == "exclusive"
              ? noncifySemanticVersion(versionRanges.toVersion.value)
              : undefined,
        },
      },
      orderBy: [
        {
          nonce: "desc",
        },
      ],
    });

    const changelogs: ChangelogResponse[] = [];
    for (const release of releases) {
      if (release.changelogEntry != null) {
        changelogs.push({
          version: release.version,
          changelogEntry: readBuffer(
            release.changelogEntry
          ) as ChangelogEntry[],
        });
      }
    }
    return { entries: changelogs };
  }
}

function convertPrismaGeneratorRelease(
  generatorRelease: prisma.GeneratorRelease | null
): GeneratorRelease | undefined {
  if (generatorRelease == null) {
    return undefined;
  }

  return {
    generatorId: FdrAPI.generators.GeneratorId(generatorRelease.generatorId),
    version: generatorRelease.version,
    irVersion: generatorRelease.irVersion,
    releaseType: convertPrismaReleaseType(generatorRelease.releaseType),
    changelogEntry:
      generatorRelease.changelogEntry != null
        ? (readBuffer(generatorRelease.changelogEntry) as ChangelogEntry[])
        : undefined,
    migration:
      generatorRelease.migration != null
        ? (readBuffer(generatorRelease.migration) as string)
        : undefined,
    customConfigSchema:
      generatorRelease.customConfigSchema != null
        ? generatorRelease.customConfigSchema
        : undefined,
    majorVersion: generatorRelease.major,
    isYanked:
      generatorRelease.isYanked != null
        ? (readBuffer(generatorRelease.isYanked) as Yank)
        : undefined,
    createdAt: generatorRelease.createdAt?.toISOString(),
    tags: generatorRelease.tags,
  };
}
