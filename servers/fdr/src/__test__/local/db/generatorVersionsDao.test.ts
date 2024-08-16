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
    // create snippets
    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "my-cool/example-with-version",
            generator_type: { type: "sdk" },
            docker_image: "my-cool/example-with-version",
            generator_language: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });

    await expect(async () => {
        await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
            generatorRelease: {
                generator_id: "my-cool/example-with-version",
                ir_version: "0.0.1",
                version: "abc.1.2",
            },
        });
    }).rejects.toThrow(new InvalidVersionError({ provided_version: "abc.1.2" }));
});

// Insert multiple and return the right latest (insert out of order)
it("generator version get latest respects semver, not time", async () => {
    // create some versions and sleep between them to ensure the timestamps are different
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "my-cool/example-with-version",
            ir_version: "0.0.2",
            version: "0.1.2",
        },
    });

    await delay(1000);
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "my-cool/example-with-version",
            ir_version: "0.0.1",
            version: "1.1.0",
        },
    });

    await delay(1000);
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "my-cool/example-with-version",
            ir_version: "0.0.1",
            version: "0.1.0",
        },
    });

    // update an old one too to impact update time
    await delay(1000);
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "my-cool/example-with-version",
            ir_version: "0.0.5",
            version: "0.1.2",
        },
    });

    // Get latest and make sure it's 1.1.0
    expect(
        (
            await fdrApplication.dao.generatorVersions().getLatestGeneratorRelease({
                getLatestGeneratorReleaseRequest: { generator: "my-cool/example-with-version" },
            })
        )?.version,
    ).toEqual("1.1.0");
});
// Get changelog
it("generator changelog", async () => {
    // create some versions and sleep between them to ensure the timestamps are different
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "my-cool/example-with-version",
            ir_version: "0.0.1",
            version: "2.1.2",
            changelog_entry: {
                type: "feat",
                added: ["added a new feature"],
            },
        },
    });
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "my-cool/example-with-version",
            ir_version: "0.0.1",
            version: "2.1.3",
            changelog_entry: {
                type: "fix",
                fixed: ["fixed that new feature"],
            },
        },
    });
    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "my-cool/example-with-version",
            ir_version: "0.0.1",
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
            generator_id: "my-cool/example-with-version",
            ir_version: "0.0.1",
            version: "2.1.6",
        },
    });

    await fdrApplication.dao.generatorVersions().upsertGeneratorRelease({
        generatorRelease: {
            generator_id: "my-cool/example-with-version",
            ir_version: "0.0.1",
            version: "2.1.8",
        },
    });

    // Note we explicitly do not include 0.1.2 and 0.1.8 in the range to ensure we're only including the range
    expect(
        await fdrApplication.dao
            .generatorVersions()
            .getChangelog({ generator: "my-cool/example-with-version", fromVersion: "2.1.3", toVersion: "2.1.7" }),
    ).toEqual(
        new Map([
            [
                "2.1.3",
                {
                    type: "fix",
                    fixed: ["fixed that new feature"],
                },
            ],
            [
                "2.1.5",
                {
                    type: "fix",
                    fixed: ["fixed that new feature"],
                    security: ["fixed a security issue"],
                    deprecated: ["idk google meet or something isn't there anymore"],
                },
            ],
        ]),
    );
});
// Update version
it("generator version happy path update", async () => {
    const releaseRequest: GeneratorReleaseRequest = {
        generator_id: "my-cool/example-with-version",
        ir_version: "0.0.2",
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
        generator: "my-cool/example-with-version",
        version: "3.1.2",
    });
    expect(release?.generator_id).toEqual(releaseRequest.generator_id);
    expect(release?.ir_version).toEqual(releaseRequest.ir_version);
    expect(release?.version).toEqual(releaseRequest.version);
    expect(release?.changelog_entry).toEqual(releaseRequest.changelog_entry);

    // Overwrite the release's changelog
    const updateReleaseRequest: GeneratorReleaseRequest = {
        generator_id: "my-cool/example-with-version",
        ir_version: "0.0.2",
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
        generator: "my-cool/example-with-version",
        version: "3.1.2",
    });
    expect(updatedRelease?.generator_id).toEqual(updateReleaseRequest.generator_id);
    expect(updatedRelease?.ir_version).toEqual(updateReleaseRequest.ir_version);
    expect(updatedRelease?.version).toEqual(updateReleaseRequest.version);
    expect(updatedRelease?.changelog_entry).toEqual(updateReleaseRequest.changelog_entry);
});
