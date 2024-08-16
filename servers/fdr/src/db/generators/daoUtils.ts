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

const NONCE_PIECE_LENGTH = 5;
export function noncifySemanticVersion(version: string): string {
    const parsedVersion = parseSemverOrThrow(version);

    let prereleaseIndicator = "15"; // Indicative of a non-prerelease version
    let prereleaseVersionNonce = "0";

    // For convenience with the semver library, we are expecting versions to come through as:
    // major.minor.patch[-prereleaseType].[prereleaseVersion] where `prereleaseVersion`
    // may be omitted and assumed as 0.
    if (parsedVersion.prerelease.length > 0 && parsedVersion.prerelease.length < 3) {
        switch (parsedVersion.prerelease[0]) {
            case "rc":
                // Leaving some room between RC (12) and GA (15) in the event we
                // ever want to add something that takes presedence over RC.
                prereleaseIndicator = "12";
                break;
            default:
                throw new InvalidVersionError({ provided_version: version });
        }
        if (parsedVersion.prerelease.length > 1) {
            const prereleaseVersion = parseInt(parsedVersion.prerelease[1] as string);
            if (isNaN(prereleaseVersion)) {
                throw new InvalidVersionError({ provided_version: version });
            }
            prereleaseVersionNonce = prereleaseVersion.toString();
        }
    } else if (parsedVersion.prerelease.length >= 3) {
        // For convenience we only want to allow alpha, beta, rc, etc.
        throw new InvalidVersionError({ provided_version: version });
    }

    return `${parsedVersion.major.toString().padStart(NONCE_PIECE_LENGTH, "0")}-${parsedVersion.minor.toString().padStart(NONCE_PIECE_LENGTH, "0")}-${parsedVersion.patch.toString().padStart(NONCE_PIECE_LENGTH, "0")}-${prereleaseIndicator}-${prereleaseVersionNonce.padStart(NONCE_PIECE_LENGTH, "0")}`;
}
