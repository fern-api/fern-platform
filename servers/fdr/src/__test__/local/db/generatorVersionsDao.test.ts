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
            generator_type: { type: "sdk" },
            docker_image: "this-fails-semver",
            generator_language: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });

    await expect(async () => {
        await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
            generatorRelease: {
                generator_id: "this-fails-semver",
                ir_version: 0,
                version: "abc.1.2",
            },
        });
    }).rejects.toThrow(new InvalidVersionError({ provided_version: "abc.1.2" }));
});

// Insert multiple and return the right latest (insert out of order)
it("generator version get latest respects semver, not time", async () => {
    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "this-picks-latest",
            generator_type: { type: "sdk" },
            docker_image: "this-picks-latest",
            generator_language: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });
    // create some versions and sleep between them to ensure the timestamps are different
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "this-picks-latest",
            ir_version: 2,
            version: "0.1.2",
        },
    });

    await delay(1000);
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "this-picks-latest",
            ir_version: 0,
            version: "1.1.0",
        },
    });

    await delay(1000);
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "this-picks-latest",
            ir_version: 0,
            version: "0.1.0",
        },
    });

    // update an old one too to impact update time
    await delay(1000);
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "this-picks-latest",
            ir_version: 5,
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
            generator_type: { type: "sdk" },
            docker_image: "this-gets-changelog",
            generator_language: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });

    // create some versions and sleep between them to ensure the timestamps are different
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "this-gets-changelog",
            ir_version: 0,
            version: "2.1.2",
            changelog_entry: {
                type: "feat",
                added: ["added a new feature"],
            },
        },
    });
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "this-gets-changelog",
            ir_version: 0,
            version: "2.1.3",
            changelog_entry: {
                type: "fix",
                fixed: ["fixed that new feature"],
            },
        },
    });
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "this-gets-changelog",
            ir_version: 0,
            version: "2.1.5",
            changelog_entry: {
                type: "fix",
                fixed: ["fixed that new feature"],
                security: ["fixed a security issue"],
                deprecated: ["idk google meet or something isn't there anymore"],
            },
        },
    });
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "this-gets-changelog",
            ir_version: 0,
            version: "2.1.6",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "this-gets-changelog",
            ir_version: 0,
            version: "2.1.8",
        },
    });

    // Note we explicitly do not include 0.1.2 and 0.1.8 in the range to ensure we're only including the range
    expect(
        await fdrApplication.dao
            .generatorVersions()
            .getChangelog({ generator: "this-gets-changelog", fromVersion: "2.1.3", toVersion: "2.1.7" }),
    ).toEqual({
        entries: [
            {
                version: "2.1.5",
                changelog_entry: {
                    type: "fix",
                    fixed: ["fixed that new feature"],
                    security: ["fixed a security issue"],
                    deprecated: ["idk google meet or something isn't there anymore"],
                },
            },
            {
                version: "2.1.3",
                changelog_entry: {
                    type: "fix",
                    fixed: ["fixed that new feature"],
                },
            },
        ],
    });
});
// Update version
it("generator version happy path update", async () => {
    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "this-is-the-happy-path",
            generator_type: { type: "sdk" },
            docker_image: "this-is-the-happy-path",
            generator_language: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });

    const releaseRequest: GeneratorReleaseRequest = {
        generator_id: "this-is-the-happy-path",
        ir_version: 2,
        version: "3.1.2",
        changelog_entry: {
            type: "fix",
            fixed: ["fixed that new feature"],
            security: ["fixed a security issue"],
            deprecated: ["idk google meet or something isn't there anymore"],
        },
    };
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: releaseRequest,
    });
    const release = await fdrApplication.dao.generatorVersions().getGeneratorRelease({
        generator: "this-is-the-happy-path",
        version: "3.1.2",
    });
    expect(release?.generator_id).toEqual(releaseRequest.generator_id);
    expect(release?.ir_version).toEqual(releaseRequest.ir_version);
    expect(release?.version).toEqual(releaseRequest.version);
    expect(release?.changelog_entry).toEqual(releaseRequest.changelog_entry);

    // Overwrite the release's changelog
    const updateReleaseRequest: GeneratorReleaseRequest = {
        generator_id: "this-is-the-happy-path",
        ir_version: 2,
        version: "3.1.2",
        changelog_entry: {
            type: "feat",
            added: ["added a new feature"],
        },
    };
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: updateReleaseRequest,
    });
    const updatedRelease = await fdrApplication.dao.generatorVersions().getGeneratorRelease({
        generator: "this-is-the-happy-path",
        version: "3.1.2",
    });
    expect(updatedRelease?.generator_id).toEqual(updateReleaseRequest.generator_id);
    expect(updatedRelease?.ir_version).toEqual(updateReleaseRequest.ir_version);
    expect(updatedRelease?.version).toEqual(updateReleaseRequest.version);
    expect(updatedRelease?.changelog_entry).toEqual(updateReleaseRequest.changelog_entry);
});

it("get generator that works for cli version", async () => {
    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "this-is-cli-restricted",
            generator_type: { type: "sdk" },
            docker_image: "this-is-cli-restricted",
            generator_language: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });

    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            version: "0.100.0",
            ir_version: 51,
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "this-is-cli-restricted",
            ir_version: 50,
            version: "2.1.8",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "this-is-cli-restricted",
            ir_version: 51,
            version: "3.0.0",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "this-is-cli-restricted",
            ir_version: 51,
            version: "3.1.0",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "this-is-cli-restricted",
            ir_version: 52,
            version: "3.5.0",
        },
    });

    // Get with retain major at 2
    const releaseRetainMajor = await fdrApplication.dao.generatorVersions().getLatestGeneratorRelease({
        getLatestGeneratorReleaseRequest: {
            generator: "this-is-cli-restricted",
            cliVersion: "0.100.0",
            retainMajorVersion: 2,
        },
    });
    expect(releaseRetainMajor?.version).toEqual("2.1.8");

    const release = await fdrApplication.dao.generatorVersions().getLatestGeneratorRelease({
        getLatestGeneratorReleaseRequest: {
            generator: "this-is-cli-restricted",
            cliVersion: "0.100.0",
        },
    });
    expect(release?.version).toEqual("3.1.0");
});
