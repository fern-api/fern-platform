import { Algolia, DocsV2Read } from "@fern-api/fdr-sdk";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import fs from "fs";
import { mapValues } from "lodash-es";
import path from "path";
import { generateAlgoliaRecords } from "../generateRecords";

const fixturesDir = path.join(__dirname, "../../../../../../fdr-sdk/src/__test__/fixtures");

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

        const records = generateAlgoliaRecords(Algolia.IndexSegmentId("0"), root, pages, apis, true);

        expect(records).toMatchSnapshot();
    });
});
