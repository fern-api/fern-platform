import { uniq } from "es-toolkit";
import { createAlgoliaRecords } from "../records/create-algolia-records";
import { readFixture, readFixtureToRootNode } from "./test-utils";

describe("humanloop", () => {
    it("should work", () => {
        const [fixture, snapshotFilepath] = readFixture("humanloop");
        const { root, apis, pages } = readFixtureToRootNode(fixture);

        const records = createAlgoliaRecords({
            root,
            domain: "humanloop.com",
            org_id: "humanloop",
            pages,
            apis,
            authed: false,
        });

        const objectIDs = records.map((record) => record.objectID);

        expect(JSON.stringify(records, null, 2)).toMatchFileSnapshot(snapshotFilepath);

        expect(uniq(objectIDs).length).toBe(objectIDs.length);
    });
});
