import * as prisma from "@prisma/client";
import semver from "semver";
import { InvalidVersionError, ReleaseType } from "../../api/generated/api/resources/generators";

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
        throw new InvalidVersionError({ providedVersion: version });
    }

    return parsedVersion;
}

export function getPrereleaseType(version: string): ReleaseType {
    return getPrereleaseTypeAndVersion(version)[0];
}

export function getPrereleaseTypeAndVersion(version: string): [ReleaseType, number] {
    const parsedVersion = parseSemverOrThrow(version);

    // For convenience with the semver library, we are expecting versions to come through as:
    // major.minor.patch[-prereleaseType].[prereleaseVersion] where `prereleaseVersion`
    // may be omitted and assumed as 0.
    if (parsedVersion.prerelease.length > 0 && parsedVersion.prerelease.length < 3) {
        const prereleaseType = parsedVersion.prerelease[0]?.toString();
        if (prereleaseType == null) {
            throw new InvalidVersionError({ providedVersion: version });
        }

        // Here we have 2 match groups, one for the type and one for the version.
        const prereleaseTypeWithVersion = prereleaseType.match(/((?:rc|alpha|beta))([0-9]+)/);
        if (
            parsedVersion.prerelease.length === 1 &&
            prereleaseTypeWithVersion != null &&
            prereleaseTypeWithVersion[1] != null &&
            prereleaseTypeWithVersion[2] != null
        ) {
            const truePrereleaseType = prereleaseTypeWithVersion[1];
            const prereleaseVersion = parseInt(prereleaseTypeWithVersion[2], 10);
            return [getPrereleaseTypeRaw(truePrereleaseType), prereleaseVersion];
        } else {
            let prereleaseVersion = 0;
            if (parsedVersion.prerelease.length > 1) {
                const truePrereleaseVersion = parseInt(parsedVersion.prerelease[1] as string);
                if (isNaN(prereleaseVersion)) {
                    throw new InvalidVersionError({ providedVersion: version });
                }
                prereleaseVersion = truePrereleaseVersion;
            }

            return [getPrereleaseTypeRaw(prereleaseType), prereleaseVersion];
        }
    } else if (parsedVersion.prerelease.length === 0) {
        return [ReleaseType.Ga, 0];
    }

    throw new InvalidVersionError({ providedVersion: version });
}

function getPrereleaseTypeRaw(version: string): ReleaseType {
    switch (version) {
        case "rc":
            return ReleaseType.Rc;
        default:
            throw new InvalidVersionError({ providedVersion: version });
    }
}
