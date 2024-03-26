import { DocsV2Read } from "@fern-api/fdr-sdk";
import fs from "fs";
import path from "path";
import { getNavigationRoot } from "../getNavigationRoot";
import { testGetAllUrlsFromDocsConfig } from "./testGetAllUrlsFromDocsConfig";

describe("getAllUrlsFromDocsConfig", () => {
    testGetAllUrlsFromDocsConfig("primer");
});

describe("getNavigationRoot", () => {
    describe("primer", () => {
        it("gets navigation root for /docs/api/introduction/getting-started", async () => {
            const fixturePath = path.join(__dirname, "fixtures", "primer.json");

            const content = fs.readFileSync(fixturePath, "utf-8");

            const fixture = JSON.parse(content) as DocsV2Read.LoadDocsForUrlResponse;

            const urls = getNavigationRoot(
                "docs/api/introduction/getting-started".split("/"),
                fixture.baseUrl.basePath,
                fixture.definition.config.navigation,
                fixture.definition.apis,
            );

            expect(urls?.type === "found" ? urls.found.versions : []).toMatchSnapshot();
        });
    });
});
