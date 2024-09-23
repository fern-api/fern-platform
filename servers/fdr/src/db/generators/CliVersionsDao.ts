import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import * as prisma from "@prisma/client";
import {
    ChangelogEntry,
    ChangelogResponse,
    CliRelease,
    CliReleaseRequest,
    GetChangelogRequest,
    GetChangelogResponse,
    GetLatestCliReleaseRequest,
    ListCliReleasesResponse,
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

export type SnippetTemplatesByEndpointIdentifier = Record<string, APIV1Read.EndpointSnippetTemplates>;

export interface CliVersionsDao {
    getLatestCliRelease({
        getLatestCliReleaseRequest,
    }: {
        getLatestCliReleaseRequest: GetLatestCliReleaseRequest;
    }): Promise<CliRelease | undefined>;

    getChangelog({ versionRanges }: { versionRanges: GetChangelogRequest }): Promise<GetChangelogResponse>;

    getMinCliForIr({ irVersion }: { irVersion: number }): Promise<CliRelease | undefined>;

    upsertCliRelease({ cliRelease }: { cliRelease: CliReleaseRequest }): Promise<void>;

    getCliRelease({ cliVersion }: { cliVersion: string }): Promise<CliRelease | undefined>;

    listCliReleases({ page, pageSize }: { page?: number; pageSize?: number }): Promise<ListCliReleasesResponse>;
}

export class CliVersionsDaoImpl implements CliVersionsDao {
    constructor(private readonly prisma: prisma.PrismaClient) {}
    async getLatestCliRelease({
        getLatestCliReleaseRequest,
    }: {
        getLatestCliReleaseRequest: GetLatestCliReleaseRequest;
    }): Promise<CliRelease | undefined> {
        const releaseTypes =
            getLatestCliReleaseRequest.releaseTypes != null
                ? getLatestCliReleaseRequest.releaseTypes.map(convertGeneratorReleaseType)
                : [prisma.ReleaseType.ga];

        const maybeRelease = await this.prisma.cliRelease.findFirst({
            where: {
                releaseType: { in: releaseTypes },
                irVersion: { gte: getLatestCliReleaseRequest.irVersion },
                isYanked: null,
            },
            orderBy: [
                {
                    nonce: "desc",
                },
            ],
        });
        return convertPrismaCliRelease(maybeRelease);
    }

    async getChangelog({ versionRanges }: { versionRanges: GetChangelogRequest }): Promise<GetChangelogResponse> {
        const releases = await this.prisma.cliRelease.findMany({
            where: {
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
                    changelogEntry: readBuffer(release.changelogEntry) as ChangelogEntry[],
                });
            }
        }
        return { entries: changelogs };
    }

    async upsertCliRelease({ cliRelease }: { cliRelease: CliReleaseRequest }): Promise<void> {
        const parsedVersion = parseSemverOrThrow(cliRelease.version);
        const data = {
            version: cliRelease.version,
            major: parsedVersion.major,
            minor: parsedVersion.minor,
            patch: parsedVersion.patch,
            nonce: noncifySemanticVersion(cliRelease.version),
            irVersion: cliRelease.irVersion,
            releaseType: convertGeneratorReleaseType(getPrereleaseType(cliRelease.version)),
            changelogEntry: cliRelease.changelogEntry != null ? writeBuffer(cliRelease.changelogEntry) : null,
            isYanked: cliRelease.isYanked != null ? writeBuffer(cliRelease.isYanked) : null,
            createdAt: cliRelease.createdAt != null ? new Date(cliRelease.createdAt) : undefined,
            tags: cliRelease.tags,
        };

        await this.prisma.cliRelease.upsert({
            where: {
                version: cliRelease.version,
            },
            update: data,
            create: data,
        });
    }

    async getMinCliForIr({ irVersion }: { irVersion: number }): Promise<CliRelease | undefined> {
        const maybeRelease = await this.prisma.cliRelease.findFirst({
            where: {
                irVersion,
            },
            orderBy: [
                {
                    // Get the lowest version
                    nonce: "asc",
                },
            ],
        });
        return convertPrismaCliRelease(maybeRelease);
    }

    async getCliRelease({ cliVersion }: { cliVersion: string }): Promise<CliRelease | undefined> {
        const maybeRelease = await this.prisma.cliRelease.findUnique({
            where: {
                version: cliVersion,
            },
        });
        return convertPrismaCliRelease(maybeRelease);
    }

    async listCliReleases({
        page = 0,
        pageSize = 20,
    }: {
        page?: number | undefined;
        pageSize?: number | undefined;
    }): Promise<ListCliReleasesResponse> {
        const releases = await this.prisma.cliRelease.findMany({
            skip: page * pageSize,
            take: pageSize,
            orderBy: [
                {
                    nonce: "desc",
                },
            ],
        });

        return { cliReleases: releases.map(convertPrismaCliRelease).filter((g): g is CliRelease => g != null) };
    }
}

function convertPrismaCliRelease(cliRelease: prisma.CliRelease | null): CliRelease | undefined {
    if (cliRelease == null) {
        return undefined;
    }

    return {
        version: cliRelease.version,
        tags: cliRelease.tags,
        irVersion: cliRelease.irVersion,
        releaseType: convertPrismaReleaseType(cliRelease.releaseType),
        changelogEntry:
            cliRelease.changelogEntry != null ? (readBuffer(cliRelease.changelogEntry) as ChangelogEntry[]) : undefined,
        majorVersion: cliRelease.major,
        isYanked: cliRelease.isYanked != null ? (readBuffer(cliRelease.isYanked) as Yank) : undefined,
        createdAt: cliRelease.createdAt?.toISOString(),
    };
}
