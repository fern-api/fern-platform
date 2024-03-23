import { DocsV2Read } from "@fern-api/fdr-sdk";
import fs from "fs";
import path from "path";
import { getNavigationRoot } from "../getNavigationRoot";

// eslint-disable-next-line jest/no-export
export function testGetNavigationRoot(fixtureName: string, slug: string): void {
    // eslint-disable-next-line jest/valid-title
    describe(fixtureName, () => {
        it("gets navigation root for " + slug, async () => {
            const fixturePath = path.join(__dirname, "fixtures", `${fixtureName}.json`);

            const content = fs.readFileSync(fixturePath, "utf-8");

            const fixture = JSON.parse(content) as DocsV2Read.LoadDocsForUrlResponse;

            const urls = getNavigationRoot(
                slug.split("/"),
                fixture.baseUrl.basePath,
                fixture.definition.apis,
                fixture.definition.config.navigation,
            );

            expect(urls).toMatchSnapshot();
        });
    });
}
