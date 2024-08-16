import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import * as prisma from "@prisma/client";
import semver from "semver";
import {
    ChangelogEntry,
    GeneratorId,
    GeneratorRelease,
    GeneratorReleaseRequest,
    GetLatestGeneratorReleaseRequest,
    Yank,
} from "../../api/generated/api/resources/generators";
import { readBuffer, writeBuffer } from "../../util";
import {
    convertGeneratorReleaseType,
    convertPrismaReleaseType,
    getSemverSortBetween,
    parseSemverOrThrow,
} from "./daoUtils";

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

export interface GeneratorVersionsDao {
    getLatestGeneratorRelease({
        getLatestGeneratorReleaseRequest,
    }: {
        getLatestGeneratorReleaseRequest: GetLatestGeneratorReleaseRequest;
    }): Promise<GeneratorRelease | undefined>;

    getChangelog({
        generator,
        fromVersion,
        toVersion,
    }: {
        generator: GeneratorId;
        fromVersion: string;
        toVersion: string;
    }): Promise<Record<string, ChangelogEntry>>;

    upsertGeneratorRelease({ generatorRelease }: { generatorRelease: GeneratorReleaseRequest }): Promise<void>;

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
    }): Promise<GeneratorRelease[]>;
}

export class GeneratorVersionsDaoImpl implements GeneratorVersionsDao {
    constructor(private readonly prisma: prisma.PrismaClient) {}

    async upsertGeneratorRelease({ generatorRelease }: { generatorRelease: GeneratorReleaseRequest }): Promise<void> {
        const parsedVersion = parseSemverOrThrow(generatorRelease.version);

        // We always just write over the previous entry here
        await this.prisma.$transaction(async (tx) => {
            // Ideally we'd set a uniqueness constraint on `isLatest` and the generator ID, but I can't find a way
            // to ensure uniqueness only when `isLatest` is true (e.g. we expect to have tons that are false).
            const currentLatest = await tx.generatorRelease.findFirst({
                where: {
                    generatorId: generatorRelease.generator_id,
                    isLatest: true,
                },
            });

            // If there isn't a latest release, then this is the latest
            // If there is a latest release, then do a semver comparison to see if this is the latest
            const isNewVersionLatest =
                currentLatest == null ? true : semver.lte(currentLatest?.version, generatorRelease.version);

            // For good measure we make all the other releases not latest, not just the one we're sure was latest
            if (isNewVersionLatest && currentLatest != null) {
                await tx.generatorRelease.updateMany({
                    where: {
                        generatorId: generatorRelease.generator_id,
                    },
                    data: {
                        isLatest: false,
                    },
                });
            }

            // Create new entry
            const isRc = semver.prerelease(generatorRelease.version) != null;
            const data = {
                version: generatorRelease.version,
                generatorId: generatorRelease.generator_id,
                irVersion: generatorRelease.ir_version,
                major: parsedVersion.major,
                minor: parsedVersion.minor,
                patch: parsedVersion.patch,
                isYanked: generatorRelease.is_yanked != null ? writeBuffer(generatorRelease.is_yanked) : undefined,
                changelogEntry:
                    generatorRelease.changelog_entry != null
                        ? writeBuffer(generatorRelease.changelog_entry)
                        : undefined,
                migration: generatorRelease.migration != null ? writeBuffer(generatorRelease.migration) : undefined,
                customConfigSchema: generatorRelease.custom_config_schema,
                releaseType: isRc ? prisma.ReleaseType.rc : prisma.ReleaseType.ga,
                isLatest: isNewVersionLatest,
            };
            await tx.generatorRelease.upsert({
                where: {
                    generatorId_version: {
                        generatorId: generatorRelease.generator_id,
                        version: generatorRelease.version,
                    },
                },
                create: data,
                update: data,
            });
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
        return maybeRelease != null ? convertPrismaGeneratorRelease(maybeRelease) : undefined;
    }

    async listGeneratorReleases({
        generator,
        page = 0,
        pageSize = 20,
    }: {
        generator: GeneratorId;
        page?: number;
        pageSize?: number;
    }): Promise<GeneratorRelease[]> {
        const releases = await this.prisma.generatorRelease.findMany({
            where: {
                generatorId: generator,
            },
            skip: page * pageSize,
            take: pageSize,
        });

        return releases.map(convertPrismaGeneratorRelease).filter((g): g is GeneratorRelease => g != null);
    }

    async getLatestGeneratorRelease({
        getLatestGeneratorReleaseRequest,
    }: {
        getLatestGeneratorReleaseRequest: GetLatestGeneratorReleaseRequest;
    }): Promise<GeneratorRelease | undefined> {
        // TODO: should we have a concept of latest per-release type? I assume no
        // So for now we only grab by `isLatest` if the release type is not RC,
        // if the release type is RC, we grab the latest RC by time.
        const releaseType =
            getLatestGeneratorReleaseRequest.releaseType != null
                ? convertGeneratorReleaseType(getLatestGeneratorReleaseRequest.releaseType)
                : undefined;
        // We similarly do not explicitly track an isLatest within the major version, so we only filter to isLatest if that is not set too
        const filterToIsLatest =
            getLatestGeneratorReleaseRequest.retainMajorVersion == null &&
            (releaseType == null || releaseType === prisma.ReleaseType.ga);

        const release = await this.prisma.generatorRelease.findFirst({
            where: {
                generatorId: getLatestGeneratorReleaseRequest.generator,
                releaseType,
                major: getLatestGeneratorReleaseRequest.retainMajorVersion,
                isLatest: filterToIsLatest ? true : undefined,
            },
            // TODO: This should ideally be a proper ordering by semver, but we'd have to paginate the response and manually sort
            // the list since you can't manage a more complex ordering in Prisma using TypeScript functions.
            orderBy: {
                createdAt: "desc",
            },
        });

        return convertPrismaGeneratorRelease(release);
    }

    async getChangelog({
        generator,
        fromVersion,
        toVersion,
    }: {
        generator: GeneratorId;
        fromVersion: string;
        toVersion: string;
    }): Promise<Record<string, ChangelogEntry>> {
        const releases = await this.prisma.generatorRelease.findMany({
            where: {
                generatorId: generator,
                ...getSemverSortBetween(fromVersion, toVersion),
            },
        });

        const changelogs: Record<string, ChangelogEntry> = {};
        for (const release of releases) {
            if (release.changelogEntry != null) {
                changelogs[release.version] = readBuffer(release.changelogEntry) as ChangelogEntry;
            }
        }
        return changelogs;
    }
}

function convertPrismaGeneratorRelease(generatorRelease: prisma.GeneratorRelease | null): GeneratorRelease | undefined {
    if (generatorRelease == null) {
        return undefined;
    }

    return {
        generator_id: generatorRelease.generatorId,
        version: generatorRelease.version,
        ir_version: generatorRelease.irVersion,
        release_type: convertPrismaReleaseType(generatorRelease.releaseType),
        changelog_entry:
            generatorRelease.changelogEntry != null
                ? (readBuffer(generatorRelease.changelogEntry) as ChangelogEntry)
                : undefined,
        migration: generatorRelease.migration != null ? (readBuffer(generatorRelease.migration) as string) : undefined,
        custom_config_schema:
            generatorRelease.customConfigSchema != null ? generatorRelease.customConfigSchema : undefined,
        major_version: generatorRelease.major,
        is_yanked: generatorRelease.isYanked != null ? (readBuffer(generatorRelease.isYanked) as Yank) : undefined,
    };
}
