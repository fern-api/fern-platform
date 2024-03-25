import { DocsV2Read } from "@fern-api/fdr-sdk";
import fs from "fs";
import path from "path";
import { getAllUrlsFromDocsConfig } from "../getAllUrlsFromDocsConfig";

export function testGetAllUrlsFromDocsConfig(fixtureName: string): void {
    // eslint-disable-next-line vitest/valid-title
    describe(fixtureName, () => {
        it("gets all urls from docs config", async () => {
            const fixturePath = path.join(__dirname, "fixtures", `${fixtureName}.json`);

            const content = fs.readFileSync(fixturePath, "utf-8");

            const fixture = JSON.parse(content) as DocsV2Read.LoadDocsForUrlResponse;

            const urls = getAllUrlsFromDocsConfig(
                fixture.baseUrl.domain,
                fixture.baseUrl.basePath,
                fixture.definition.config.navigation,
                fixture.definition.apis,
            );

            expect(urls).toMatchSnapshot();
        });
    });
}
