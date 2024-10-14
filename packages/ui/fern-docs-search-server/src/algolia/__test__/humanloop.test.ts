import { Algolia, ApiDefinition, DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import { mapValues } from "es-toolkit/object";
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
    it("should work", async () => {
        const fixture = readFixture("humanloop");
        const root = FernNavigation.utils.toRootNode(fixture);

        const apis = Object.fromEntries(
            await Promise.all(
                Object.values(fixture.definition.apis).map(async (api) => {
                    return [
                        api.id,
                        await ApiDefinition.ApiDefinitionV1ToLatest.from(api, {
                            useJavaScriptAsTypeScript: false,
                            alwaysEnableJavaScriptFetch: false,
                            usesApplicationJsonInFormDataValue: false,
                        }).migrate(),
                    ];
                }),
            ),
        );

        const pages = mapValues(fixture.definition.pages, (page) => page.markdown);

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
