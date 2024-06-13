import { getLatestTag } from "@fern-api/github";
import semver from "semver";
import {
    FailedToComputeExistingVersion,
    FailedToIncrementVersion,
    Language,
} from "../../api/generated/api/resources/sdks";
import { VersionsService } from "../../api/generated/api/resources/sdks/resources/versions/service/VersionsService";
import { FdrApplication } from "../../app";
import { getLatestVersionFromNpm, getLatestVersionFromPypi } from "./getLatestVersion";

export function getVersionsService(app: FdrApplication): VersionsService {
    return new VersionsService({
        computeSemanticVersion: async (req, res) => {
            const existingVersion = await getExistingVersion({
                githubRepository: req.body.githubRepository,
                packageName: req.body.package,
                language: req.body.language,
            });
            if (existingVersion == null) {
                throw new FailedToComputeExistingVersion();
            }

            // TODO(armando): make this more robust by factoring in api definition changes
            const nextVersion = semver.inc(existingVersion, "patch");
            if (nextVersion == null) {
                throw new FailedToIncrementVersion();
            }

            return res.send({
                version: nextVersion,
                bump: "PATCH",
            });
        },
    });
}

// NOTE: this does not handle private registries or private github repositories
export async function getExistingVersion({
    packageName,
    language,
    githubRepository,
}: {
    packageName: string;
    language: Language;
    githubRepository: string | undefined;
}): Promise<string | undefined> {
    let version: string | undefined = undefined;

    // Step 1: Fetch from registries directly
    switch (language) {
        case "TypeScript":
            version = await getLatestVersionFromNpm(packageName);
            break;
        case "Python":
            version = await getLatestVersionFromPypi(packageName);
            break;
        case "Csharp":
            break;
        case "Go":
            break;
        case "Java":
            break;
        case "Ruby":
            break;
    }
    if (version != null) {
        return version;
    }

    // Step 2: Fetch from Github Tag
    if (githubRepository != null) {
        version = await getLatestTag(githubRepository);
    }

    return version;
}
