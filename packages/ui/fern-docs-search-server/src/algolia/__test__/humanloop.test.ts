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

describe("humanloop", () => {
    it("should work", () => {
        const fixture = readFixture("humanloop");
        const root = FernNavigation.utils.toRootNode(fixture);

        // const apis = Object.fromEntries(
        //     Object.values(fixture.definition.apis).map((api) => {
        //         return [
        //             api.id,
        //             ApiDefinition.ApiDefinitionV1ToLatest.from(api, {
        //                 useJavaScriptAsTypeScript: false,
        //                 alwaysEnableJavaScriptFetch: false,
        //                 usesApplicationJsonInFormDataValue: false,
        //             }).migrate(),
        //         ];
        //     }),
        // );
        const apis = FernNavigation.utils.toApis(fixture);

        // const pages = mapValues(fixture.definition.pages, (page) => page.markdown);
        const pages = FernNavigation.utils.toPages(fixture);

        const records = generateAlgoliaRecords({
            indexSegmentId: Algolia.IndexSegmentId("0"),
            nodes: root,
            pages,
            apis,
            isFieldRecordsEnabled: true,
        });

        expect(records).toMatchSnapshot();
    });
});
