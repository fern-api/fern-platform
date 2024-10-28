import { ApiDefinition, DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import { uniq } from "es-toolkit";
import { mapValues } from "es-toolkit/object";
import fs from "fs";
import path from "path";
import { createAlgoliaRecords } from "../records/create-algolia-records.js";

const fixturesDir = path.join(__dirname, "../../../../../fdr-sdk/src/__test__/fixtures");

function readFixture(fixture: string) {
    const fixturePath = path.join(fixturesDir, `${fixture}.json`);
    const content = fs.readFileSync(fixturePath, "utf-8");
    return JSON.parse(content) as DocsV2Read.LoadDocsForUrlResponse;
}

describe("humanloop", () => {
    it("should work", () => {
        const fixture = readFixture("humanloop");
        const root = FernNavigation.utils.toRootNode(fixture);
        const apis = Object.fromEntries(
            Object.values(fixture.definition.apis).map((api) => {
                return [
                    api.id,
                    ApiDefinition.ApiDefinitionV1ToLatest.from(api, {
                        useJavaScriptAsTypeScript: false,
                        alwaysEnableJavaScriptFetch: false,
                        usesApplicationJsonInFormDataValue: false,
                    }).migrate(),
                ];
            }),
        );
        const pages = mapValues(fixture.definition.pages, (page) => page.markdown);

        const records = createAlgoliaRecords({
            root,
            domain: "humanloop.com",
            org_id: "humanloop",
            pages,
            apis,
            authed: false,
        });

        const objectIDs = records.map((record) => record.objectID);

        expect(JSON.stringify(records, null, 2)).toMatchFileSnapshot("__snapshots__/humanloop.json");

        expect(uniq(objectIDs).length).toBe(objectIDs.length);
    });
});
