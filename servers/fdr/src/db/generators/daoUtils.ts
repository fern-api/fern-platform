import * as prisma from "@prisma/client";
import semver from "semver";
import { InvalidVersionError, ReleaseType } from "../../api/generated/api/resources/generators";

export function getSemverSortBetween(
    fromVersion: string,
    toVersion: string,
): {
    major: { gte: number | undefined; lte: number | undefined };
    minor: { gte: number | undefined; lte: number | undefined };
    patch: { gte: number | undefined; lte: number | undefined };
} {
    const fromSem = semver.parse(fromVersion);
    const toSem = semver.parse(toVersion);

    return {
        major: {
            gte: fromSem?.major,
            lte: toSem?.major,
        },
        minor: {
            gte: fromSem?.minor,
            lte: toSem?.minor,
        },
        patch: {
            gte: fromSem?.patch,
            lte: toSem?.patch,
        },
    };
}

export function convertGeneratorReleaseType(releaseType: ReleaseType): prisma.ReleaseType {
    switch (releaseType) {
        case ReleaseType.Ga:
            return prisma.ReleaseType.ga;
        case ReleaseType.Rc:
            return prisma.ReleaseType.rc;
    }
}

export function convertPrismaReleaseType(releaseType: prisma.ReleaseType): ReleaseType {
    switch (releaseType) {
        case prisma.ReleaseType.ga:
            return ReleaseType.Ga;
        case prisma.ReleaseType.rc:
            return ReleaseType.Rc;
    }
}

export function parseSemverOrThrow(version: string): semver.SemVer {
    const parsedVersion = semver.parse(version);
    if (parsedVersion == null) {
        throw new InvalidVersionError({ provided_version: version });
    }

    return parsedVersion;
}

export function getPrereleaseType(version: string): ReleaseType {
    const parsedVersion = parseSemverOrThrow(version);

    if (parsedVersion.prerelease.length > 0) {
        switch (parsedVersion.prerelease[0]) {
            case "rc":
                return ReleaseType.Rc;
            default:
                throw new InvalidVersionError({ provided_version: version });
        }
    }

    return ReleaseType.Ga;
}
