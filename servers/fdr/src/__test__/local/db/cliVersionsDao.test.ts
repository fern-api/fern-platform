import { CliReleaseRequest } from "@fern-api/fdr-sdk/src/client/generated/api/resources/generators";
import { InvalidVersionError, ReleaseType } from "../../../api/generated/api/resources/generators";
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
                ir_version: "0.0.1",
            },
        });
    }).rejects.toThrow(new InvalidVersionError({ provided_version: "abc.1.2" }));
});

it("generator version get latest respects semver, not time", async () => {
    // create some versions and sleep between them to ensure the timestamps are different
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            version: "0.1.2",
            ir_version: "0.0.1",
        },
    });

    await delay(1000);
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            version: "1.1.0",
            ir_version: "1.1.0",
        },
    });

    await delay(1000);
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            version: "0.1.5",
            ir_version: "0.0.3",
        },
    });

    // update an old one too to impact update time
    await delay(1000);
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            version: "1.1.0-rc.1",
            ir_version: "0.0.3",
        },
    });

    expect(
        (await fdrApplication.dao.cliVersions().getLatestCliRelease({ getLatestCliReleaseRequest: {} }))?.version,
    ).toEqual("1.1.0");
    expect(
        (
            await fdrApplication.dao
                .cliVersions()
                .getLatestCliRelease({ getLatestCliReleaseRequest: { releaseType: ReleaseType.Rc } })
        )?.version,
    ).toEqual("1.1.0-rc.1");
    expect(
        (
            await fdrApplication.dao
                .cliVersions()
                .getLatestCliRelease({ getLatestCliReleaseRequest: { releaseType: ReleaseType.Ga } })
        )?.version,
    ).toEqual("1.1.0");
});

it("generator changelog", async () => {
    // create some versions and sleep between them to ensure the timestamps are different
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            ir_version: "1.1.0-rc.0",
            version: "2.1.2",
            changelog_entry: {
                type: "feat",
                added: ["added a new feature"],
            },
        },
    });
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            ir_version: "1.1.0-rc.0",
            version: "2.1.3",
            changelog_entry: {
                type: "fix",
                fixed: ["fixed that new feature"],
            },
        },
    });
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            ir_version: "1.1.0-rc.0",
            version: "2.1.5",
            changelog_entry: {
                type: "fix",
                fixed: ["fixed that new feature"],
                security: ["fixed a security issue"],
                deprecated: ["idk google meet or something isn't there anymore"],
            },
        },
    });
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            ir_version: "1.1.0-rc.0",
            version: "2.1.6",
        },
    });

    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            ir_version: "0.0.1",
            version: "2.1.8",
        },
    });

    // Note we explicitly do not include 0.1.2 and 0.1.8 in the range to ensure we're only including the range
    expect(await fdrApplication.dao.cliVersions().getChangelog({ fromVersion: "2.1.3", toVersion: "2.1.7" })).toEqual({
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

it("generator version happy path update", async () => {
    const releaseRequest: CliReleaseRequest = {
        ir_version: "0.0.2",
        version: "3.1.2",
        changelog_entry: {
            type: "fix",
            fixed: ["fixed that new feature"],
            security: ["fixed a security issue"],
            deprecated: ["idk google meet or something isn't there anymore"],
        },
    };
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: releaseRequest,
    });
    const release = await fdrApplication.dao.cliVersions().getCliRelease({
        cliVersion: "3.1.2",
    });
    expect(release?.ir_version).toEqual(releaseRequest.ir_version);
    expect(release?.version).toEqual(releaseRequest.version);
    expect(release?.changelog_entry).toEqual(releaseRequest.changelog_entry);

    // Overwrite the release's changelog
    const updateReleaseRequest: CliReleaseRequest = {
        ir_version: "0.0.2",
        version: "3.1.2",
        changelog_entry: {
            type: "feat",
            added: ["added a new feature"],
        },
    };
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: updateReleaseRequest,
    });
    const updatedRelease = await fdrApplication.dao.cliVersions().getCliRelease({
        cliVersion: "3.1.2",
    });
    expect(updatedRelease?.ir_version).toEqual(updateReleaseRequest.ir_version);
    expect(updatedRelease?.version).toEqual(updateReleaseRequest.version);
    expect(updatedRelease?.changelog_entry).toEqual(updateReleaseRequest.changelog_entry);
});

it("generator version happy path update", async () => {
    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            ir_version: "0.0.2",
            version: "0.1.2-rc0",
        },
    });
    const oneCli = await fdrApplication.dao.cliVersions().getCliRelease({
        cliVersion: "0.1.2-rc0",
    });
    expect(oneCli?.release_type).toEqual(ReleaseType.Rc);
    expect(noncifySemanticVersion("0.1.2-rc0")).toEqual("00000-00001-00002-12-00000");

    await fdrApplication.dao.cliVersions().upsertCliRelease({
        cliRelease: {
            ir_version: "0.0.2",
            version: "0.1.2-rc.1",
        },
    });
    const twoCli = await fdrApplication.dao.cliVersions().getCliRelease({
        cliVersion: "0.1.2-rc.1",
    });
    expect(twoCli?.release_type).toEqual(ReleaseType.Rc);
    expect(noncifySemanticVersion("0.1.2-rc.1")).toEqual("00000-00001-00002-12-00001");
});
