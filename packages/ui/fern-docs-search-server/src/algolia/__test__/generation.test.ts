import { Algolia, DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import fs from "fs";
import path from "path";
import { generateAlgoliaRecords } from "../records/generateAlgoliaRecords.js";

const fixturesDir = path.join(__dirname, "../../../../../fdr-sdk/src/__test__/fixtures");

function readFixture(fixture: string) {
    const fixturePath = path.join(fixturesDir, `${fixture}.json`);
    const content = fs.readFileSync(fixturePath, "utf-8");
    return JSON.parse(content) as DocsV2Read.LoadDocsForUrlResponse;
}

for (const fixtureName of [
    "athena",
    "airtop-dev",
    "stack-auth",
    "yes-version-no-tabs",
    "credal",
    "no-version-no-tabs",
    "octoai",
    "thera-staging",
    "primer",
    "propexo",
    "scoutos",
    "intrinsic",
    "vellum",
    "beehiiv",
    "uploadcare",
    "keet",
    "cohere",
    "assemblyai",
    "ferry",
    "humanloop",
    "astronomer",
    "flatfile",
    // "monite",
    "navipartner",
    "boundary",
    "twelvelabs",
    "polytomic",
    "yes-version-yes-tabs",
    "hume",
    "no-version-yes-tabs",
]) {
    // eslint-disable-next-line vitest/valid-title
    describe(fixtureName, () => {
        it("should work", () => {
            const fixture = readFixture(fixtureName);
            const root = FernNavigation.utils.toRootNode(fixture);
            const apis = FernNavigation.utils.toApis(fixture);
            const pages = FernNavigation.utils.toPages(fixture);

            const records = generateAlgoliaRecords({
                indexSegmentId: Algolia.IndexSegmentId("0"),
                nodes: root,
                pages,
                apis,
                isFieldRecordsEnabled: true,
            });

            records.forEach((record) => {
                if (
                    (record.type === "page-v4" ||
                        record.type === "endpoint-v4" ||
                        record.type === "endpoint-field-v1") &&
                    record.description
                ) {
                    expect(record.description.length).toBeLessThan(95000);
                }
                if ((record.type === "endpoint-v3" || record.type === "page-v3") && record.content) {
                    expect(record.content.length).toBeLessThan(95000);
                }
            });
            expect(records).toMatchFileSnapshot(path.join("__snapshots__", `${fixtureName}.test.ts.snap`));
        });
    });
}
