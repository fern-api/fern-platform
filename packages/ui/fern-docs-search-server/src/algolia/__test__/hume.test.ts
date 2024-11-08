import { uniq } from "es-toolkit";
import { createAlgoliaRecords } from "../records/create-algolia-records";
import { readFixture, readFixtureToRootNode } from "./test-utils";

describe("hume", () => {
    it("should work", async () => {
        const [fixture, snapshotFilepath] = readFixture("hume");
        const { root, apis, pages } = readFixtureToRootNode(fixture);

        const records = await createAlgoliaRecords({
            root,
            domain: "dev.hume.ai",
            org_id: "hume",
            pages,
            apis,
            authed: false,
        });

        const objectIDs = records.map((record) => record.objectID);

        expect(JSON.stringify(records, null, 2)).toMatchFileSnapshot(snapshotFilepath);

        expect(uniq(objectIDs).length).toBe(objectIDs.length);
    });
});
