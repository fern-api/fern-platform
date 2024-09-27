import { FdrAPI } from "@fern-api/fdr-sdk";
import { CliReleaseRequest, InvalidVersionError, ReleaseType } from "../../../api/generated/api/resources/generators";
import { noncifySemanticVersion } from "../../../db/generators/noncifySemanticVersion";
import { createMockFdrApplication } from "../../mock";

const fdrApplication = createMockFdrApplication({
    orgIds: ["acme", "octoai"],
});

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

it("cli verion not semver", async () => {
    await expect(async () => {
        await fdrApplication.dao.cliVersions().upsertCliRelease({
            cliRelease: {
                version: "abc.1.2",
                irVersion: 0,
                createdAt: undefined,
                isYanked: undefined,
                changelogEntry: undefined,
                tags: undefined,
            },
        });
    }).rejects.toThrow(new InvalidVersionError({ providedVersion: "abc.1.2" }));
});

it("cli release with tags and URLs", async () => {
    const release: CliReleaseRequest = {
        version: "0.1.2-rc13",
        irVersion: 0,
        tags: ["OpenAPI", "Fern Definition"],
        changelogEntry: [
            {
                type: "feat",
                summary: "added a new feature",
                added: ["added a new feature"],
                links: ["https://123.com"],
                upgradeNotes: undefined,
                changed: undefined,
                deprecated: undefined,
                removed: undefined,
                fixed: undefined,
            },
        ],
        createdAt: undefined,
        isYanked: undefined,
    };

    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: release,
    });

    const dbRelease = await fdrApplication.dao.cliVersions().getCliRelease({ cliVersion: "0.1.2-rc13" });
    expect(dbRelease).not.toBeUndefined();
    expect(dbRelease?.tags).toEqual(release.tags);
    expect(dbRelease?.changelogEntry?.[0]?.links).toEqual(release.changelogEntry?.[0]?.links);
});

it("cli version get latest respects semver, not time", async () => {
    // create some versions and sleep between them to ensure the timestamps are different
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            version: "0.1.2",
            irVersion: 0,
            createdAt: undefined,
            isYanked: undefined,
            changelogEntry: undefined,
            tags: undefined,
        },
    });

    await delay(1000);
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            version: "1.1.0",
            irVersion: 1,
            createdAt: undefined,
            isYanked: undefined,
            changelogEntry: undefined,
            tags: undefined,
        },
    });

    await delay(1000);
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            version: "0.1.5",
            irVersion: 0,
            createdAt: undefined,
            isYanked: undefined,
            changelogEntry: undefined,
            tags: undefined,
        },
    });

    // update an old one too to impact update time
    await delay(1000);
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            version: "1.1.0-rc.1",
            irVersion: 0,
            createdAt: undefined,
            isYanked: undefined,
            changelogEntry: undefined,
            tags: undefined,
        },
    });

    expect(
        (await fdrApplication.dao.cliVersions().getLatestCliRelease({ getLatestCliReleaseRequest: {} }))?.version,
    ).toEqual("1.1.0");
    expect(
        (
            await fdrApplication.dao
                .cliVersions()
                .getLatestCliRelease({ getLatestCliReleaseRequest: { releaseTypes: [ReleaseType.Rc] } })
        )?.version,
    ).toEqual("1.1.0-rc.1");
    expect(
        (
            await fdrApplication.dao
                .cliVersions()
                .getLatestCliRelease({ getLatestCliReleaseRequest: { releaseTypes: [ReleaseType.Ga] } })
        )?.version,
    ).toEqual("1.1.0");
});

it("generator changelog", async () => {
    // create some versions and sleep between them to ensure the timestamps are different
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            irVersion: 1,
            version: "2.1.2",
            changelogEntry: [
                {
                    type: "feat",
                    summary: "added a new feature",
                    added: ["added a new feature"],
                    links: undefined,
                    upgradeNotes: undefined,
                    changed: undefined,
                    deprecated: undefined,
                    removed: undefined,
                    fixed: undefined,
                },
            ],
            createdAt: undefined,
            isYanked: undefined,
            tags: undefined,
        },
    });
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            irVersion: 1,
            version: "2.1.3",
            changelogEntry: [
                {
                    type: "fix",
                    summary: "fixed that new feature",
                    fixed: ["fixed that new feature"],
                    links: undefined,
                    upgradeNotes: undefined,
                    added: undefined,
                    changed: undefined,
                    deprecated: undefined,
                    removed: undefined,
                },
            ],
            createdAt: undefined,
            isYanked: undefined,
            tags: undefined,
        },
    });
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            irVersion: 1,
            version: "2.1.5",
            changelogEntry: [
                {
                    type: "fix",
                    summary: "did a bunch of stuff",
                    fixed: ["fixed that new feature"],
                    deprecated: ["idk google meet or something isn't there anymore"],
                    links: undefined,
                    upgradeNotes: undefined,
                    added: undefined,
                    changed: undefined,
                    removed: undefined,
                },
            ],
            createdAt: undefined,
            isYanked: undefined,
            tags: undefined,
        },
    });
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            irVersion: 1,
            version: "2.1.6",
            createdAt: undefined,
            isYanked: undefined,
            changelogEntry: undefined,
            tags: undefined,
        },
    });

    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            irVersion: 0,
            version: "2.1.8",
            createdAt: undefined,
            isYanked: undefined,
            changelogEntry: undefined,
            tags: undefined,
        },
    });

    // Note we explicitly do not include 0.1.2 and 0.1.8 in the range to ensure we're only including the range
    expect(
        await fdrApplication.dao.cliVersions().getChangelog({
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
                        summary: "did a bunch of stuff",
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
            generator: FdrAPI.generators.GeneratorId("this-gets-changelog"),
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
            generator: FdrAPI.generators.GeneratorId("this-gets-changelog"),
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

it("cli version happy path update", async () => {
    const releaseRequest: CliReleaseRequest = {
        irVersion: 0,
        version: "3.1.2",
        changelogEntry: [
            {
                type: "fix",
                summary: "did a couple things",
                fixed: ["fixed that new feature"],
                deprecated: ["idk google meet or something isn't there anymore"],
                links: undefined,
                upgradeNotes: undefined,
                added: undefined,
                changed: undefined,
                removed: undefined,
            },
        ],
        createdAt: undefined,
        isYanked: undefined,
        tags: undefined,
    };
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: releaseRequest,
    });
    const release = await fdrApplication.dao.cliVersions().getCliRelease({
        cliVersion: "3.1.2",
    });
    expect(release?.irVersion).toEqual(releaseRequest.irVersion);
    expect(release?.version).toEqual(releaseRequest.version);
    expect(release?.changelogEntry).toEqual(releaseRequest.changelogEntry);

    // Overwrite the release's changelog
    const updateReleaseRequest: CliReleaseRequest = {
        irVersion: 0,
        version: "3.1.2",
        changelogEntry: [
            {
                type: "feat",
                summary: "added a new feature",
                added: ["added a new feature"],
                links: undefined,
                upgradeNotes: undefined,
                changed: undefined,
                deprecated: undefined,
                removed: undefined,
                fixed: undefined,
            },
        ],
        createdAt: undefined,
        isYanked: undefined,
        tags: undefined,
    };
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: updateReleaseRequest,
    });
    const updatedRelease = await fdrApplication.dao.cliVersions().getCliRelease({
        cliVersion: "3.1.2",
    });
    expect(updatedRelease?.irVersion).toEqual(updateReleaseRequest.irVersion);
    expect(updatedRelease?.version).toEqual(updateReleaseRequest.version);
    expect(updatedRelease?.changelogEntry).toEqual(updateReleaseRequest.changelogEntry);
});

it("cli version rc versions", async () => {
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            irVersion: 0,
            version: "0.1.2-rc0",
            createdAt: undefined,
            isYanked: undefined,
            changelogEntry: undefined,
            tags: undefined,
        },
    });
    const oneCli = await fdrApplication.dao.cliVersions().getCliRelease({
        cliVersion: "0.1.2-rc0",
    });
    expect(oneCli?.releaseType).toEqual(ReleaseType.Rc);
    expect(noncifySemanticVersion("0.1.2-rc0")).toEqual("00000-00001-00002-12-00000");

    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            irVersion: 0,
            version: "0.1.2-rc.1",
            createdAt: undefined,
            isYanked: undefined,
            changelogEntry: undefined,
            tags: undefined,
        },
    });
    const twoCli = await fdrApplication.dao.cliVersions().getCliRelease({
        cliVersion: "0.1.2-rc.1",
    });
    expect(twoCli?.releaseType).toEqual(ReleaseType.Rc);
    expect(noncifySemanticVersion("0.1.2-rc.1")).toEqual("00000-00001-00002-12-00001");
});
