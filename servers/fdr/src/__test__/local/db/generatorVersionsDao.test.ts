import { FdrAPI } from "@fern-api/fdr-sdk";
import { GeneratorReleaseRequest } from "@fern-api/fdr-sdk/src/client/generated/api/resources/generators";
import { InvalidVersionError } from "../../../api/generated/api/resources/generators";
import { createMockFdrApplication } from "../../mock";

const fdrApplication = createMockFdrApplication({
    orgIds: ["acme", "octoai"],
});

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Bad version on create throws
it("generator version dao not semver", async () => {
    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "this-fails-semver",
            displayName: "An SDK",
            generatorType: { type: "sdk" },
            dockerImage: "this-fails-semver",
            generatorLanguage: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });

    await expect(async () => {
        await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
            generatorRelease: {
                generatorId: "this-fails-semver",
                irVersion: 0,
                version: "abc.1.2",
            },
        });
    }).rejects.toThrow(new InvalidVersionError({ providedVersion: "abc.1.2" }));
});

// Insert multiple and return the right latest (insert out of order)
it("generator version get latest respects semver, not time", async () => {
    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "this-picks-latest",
            displayName: "An SDK",
            generatorType: { type: "sdk" },
            dockerImage: "this-picks-latest",
            generatorLanguage: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });
    // create some versions and sleep between them to ensure the timestamps are different
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-picks-latest",
            irVersion: 2,
            version: "0.1.2",
        },
    });

    await delay(1000);
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-picks-latest",
            irVersion: 0,
            version: "1.1.0",
        },
    });

    await delay(1000);
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-picks-latest",
            irVersion: 0,
            version: "0.1.0",
        },
    });

    // update an old one too to impact update time
    await delay(1000);
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-picks-latest",
            irVersion: 5,
            version: "0.1.2",
        },
    });

    // Get latest and make sure it's 1.1.0
    expect(
        (
            await fdrApplication.dao.generatorVersions().getLatestGeneratorRelease({
                getLatestGeneratorReleaseRequest: { generator: "this-picks-latest" },
            })
        )?.version,
    ).toEqual("1.1.0");
});
// Get changelog
it("generator changelog", async () => {
    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "this-gets-changelog",
            displayName: "An SDK",
            generatorType: { type: "sdk" },
            dockerImage: "this-gets-changelog",
            generatorLanguage: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });

    // create some versions and sleep between them to ensure the timestamps are different
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-gets-changelog",
            irVersion: 0,
            version: "2.1.2",
            changelogEntry: [
                {
                    type: "feat",
                    summary: "added a new feature",
                    added: ["added a new feature"],
                },
            ],
        },
    });
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-gets-changelog",
            irVersion: 0,
            version: "2.1.3",
            changelogEntry: [
                {
                    type: "fix",
                    summary: "fixed that new feature",
                    fixed: ["fixed that new feature"],
                },
            ],
        },
    });
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-gets-changelog",
            irVersion: 0,
            version: "2.1.5",
            changelogEntry: [
                {
                    type: "fix",
                    summary: "did a couple things",
                    fixed: ["fixed that new feature"],
                    deprecated: ["idk google meet or something isn't there anymore"],
                },
            ],
        },
    });
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-gets-changelog",
            irVersion: 0,
            version: "2.1.6",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-gets-changelog",
            irVersion: 0,
            version: "2.1.8",
        },
    });

    // Note we explicitly do not include 0.1.2 and 0.1.8 in the range to ensure we're only including the range
    expect(
        await fdrApplication.dao.generatorVersions().getChangelog({
            generator: "this-gets-changelog",
            versionRanges: {
                fromVersion: { type: "inclusive", value: "2.1.3" },
                toVersion: { type: "inclusive", value: "2.1.7" },
            },
        }),
    ).toEqual({
        entries: [
            {
                version: "2.1.5",
                changelogEntry: [
                    {
                        type: "fix",
                        summary: "did a couple things",
                        fixed: ["fixed that new feature"],
                        deprecated: ["idk google meet or something isn't there anymore"],
                    },
                ],
            },
            {
                version: "2.1.3",
                changelogEntry: [
                    {
                        type: "fix",
                        summary: "fixed that new feature",
                        fixed: ["fixed that new feature"],
                    },
                ],
            },
        ],
    });

    // Should not get the minimum, given it's exclusive
    expect(
        await fdrApplication.dao.generatorVersions().getChangelog({
            generator: "this-gets-changelog",
            versionRanges: {
                fromVersion: { type: "exclusive", value: "2.1.3" },
                toVersion: { type: "exclusive", value: "2.1.7" },
            },
        }),
    ).toEqual({
        entries: [
            {
                version: "2.1.5",
                changelogEntry: [
                    {
                        type: "fix",
                        summary: "did a couple things",
                        fixed: ["fixed that new feature"],
                        deprecated: ["idk google meet or something isn't there anymore"],
                    },
                ],
            },
        ],
    });

    // Should get every changelog
    expect(
        await fdrApplication.dao.generatorVersions().getChangelog({
            generator: "this-gets-changelog",
            versionRanges: {
                fromVersion: { type: "inclusive", value: "2.1.2" },
                toVersion: { type: "inclusive", value: "2.1.8" },
            },
        }),
    ).toEqual({
        entries: [
            {
                version: "2.1.5",
                changelogEntry: [
                    {
                        type: "fix",
                        summary: "did a couple things",
                        fixed: ["fixed that new feature"],
                        deprecated: ["idk google meet or something isn't there anymore"],
                    },
                ],
            },
            {
                version: "2.1.3",
                changelogEntry: [
                    {
                        type: "fix",
                        summary: "fixed that new feature",
                        fixed: ["fixed that new feature"],
                    },
                ],
            },
            {
                version: "2.1.2",
                changelogEntry: [
                    {
                        type: "feat",
                        summary: "added a new feature",
                        added: ["added a new feature"],
                    },
                ],
            },
        ],
    });
});
// Update version
it("generator version happy path update", async () => {
    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "this-is-the-happy-path",
            displayName: "An SDK",
            generatorType: { type: "sdk" },
            dockerImage: "this-is-the-happy-path",
            generatorLanguage: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });

    const releaseRequest: GeneratorReleaseRequest = {
        generatorId: "this-is-the-happy-path",
        irVersion: 2,
        version: "3.1.2",
        changelogEntry: [
            {
                type: "fix",
                summary: "did a couple things",
                fixed: ["fixed that new feature"],
                deprecated: ["idk google meet or something isn't there anymore"],
            },
        ],
    };
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: releaseRequest,
    });
    const release = await fdrApplication.dao.generatorVersions().getGeneratorRelease({
        generator: "this-is-the-happy-path",
        version: "3.1.2",
    });
    expect(release?.generatorId).toEqual(releaseRequest.generatorId);
    expect(release?.irVersion).toEqual(releaseRequest.irVersion);
    expect(release?.version).toEqual(releaseRequest.version);
    expect(release?.changelogEntry).toEqual(releaseRequest.changelogEntry);

    // Overwrite the release's changelog
    const updateReleaseRequest: GeneratorReleaseRequest = {
        generatorId: "this-is-the-happy-path",
        irVersion: 2,
        version: "3.1.2",
        changelogEntry: [
            {
                type: "feat",
                summary: "added a new feature",
                added: ["added a new feature"],
            },
        ],
    };
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: updateReleaseRequest,
    });
    const updatedRelease = await fdrApplication.dao.generatorVersions().getGeneratorRelease({
        generator: "this-is-the-happy-path",
        version: "3.1.2",
    });
    expect(updatedRelease?.generatorId).toEqual(updateReleaseRequest.generatorId);
    expect(updatedRelease?.irVersion).toEqual(updateReleaseRequest.irVersion);
    expect(updatedRelease?.version).toEqual(updateReleaseRequest.version);
    expect(updatedRelease?.changelogEntry).toEqual(updateReleaseRequest.changelogEntry);
});

it("get generator that works for cli version", async () => {
    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "this-is-cli-restricted",
            displayName: "An SDK",
            generatorType: { type: "sdk" },
            dockerImage: "this-is-cli-restricted",
            generatorLanguage: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });

    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            version: "0.100.0",
            irVersion: 52,
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-is-cli-restricted",
            irVersion: 50,
            version: "2.1.8",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-is-cli-restricted",
            irVersion: 51,
            version: "3.0.0",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-is-cli-restricted",
            irVersion: 51,
            version: "3.1.0",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-is-cli-restricted",
            irVersion: 52,
            version: "3.5.0",
        },
    });

    // Get with retain major at 2
    const releaseRetainMajor = await fdrApplication.dao.generatorVersions().getLatestGeneratorRelease({
        getLatestGeneratorReleaseRequest: {
            generator: "this-is-cli-restricted",
            cliVersion: "0.100.0",
            generatorMajorVersion: 2,
        },
    });
    expect(releaseRetainMajor?.version).toEqual("2.1.8");

    const release = await fdrApplication.dao.generatorVersions().getLatestGeneratorRelease({
        getLatestGeneratorReleaseRequest: {
            generator: "this-is-cli-restricted",
            cliVersion: "0.100.0",
        },
    });
    expect(release?.version).toEqual("3.5.0");
});

it("get generator retain major version", async () => {
    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "this-is-major-version-restricted",
            displayName: "An SDK",
            generatorType: { type: "sdk" },
            dockerImage: "this-is-major-version-restricted",
            generatorLanguage: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-is-major-version-restricted",
            irVersion: 50,
            version: "2.0.0",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-is-major-version-restricted",
            irVersion: 50,
            version: "2.1.0-rc0",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-is-major-version-restricted",
            irVersion: 50,
            version: "2.1.8",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-is-major-version-restricted",
            irVersion: 51,
            version: "3.0.0",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-is-major-version-restricted",
            irVersion: 51,
            version: "3.1.0",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generatorId: "this-is-major-version-restricted",
            irVersion: 52,
            version: "3.5.0",
        },
    });

    // Get with retain major at 2
    const releaseRetainMajor = await fdrApplication.dao.generatorVersions().getLatestGeneratorRelease({
        getLatestGeneratorReleaseRequest: {
            generator: "this-is-major-version-restricted",
            releaseTypes: ["GA"],
            generatorMajorVersion: 2,
        },
    });
    expect(releaseRetainMajor?.version).toEqual("2.1.8");

    const release = await fdrApplication.dao.generatorVersions().getLatestGeneratorRelease({
        getLatestGeneratorReleaseRequest: {
            generator: "this-is-major-version-restricted",
            releaseTypes: ["GA"],
        },
    });
    expect(release?.version).toEqual("3.5.0");
});
