import { DocsV2Read } from "@fern-api/fdr-sdk";
import fs from "fs";
import path from "path";
import { getNavigationRoot } from "../getNavigationRoot";

export function testGetNavigationRoot(fixtureName: string, slug: string): void {
    // eslint-disable-next-line vitest/valid-title
    describe(fixtureName, () => {
        it("gets navigation root for /" + slug, async () => {
            const fixturePath = path.join(__dirname, "fixtures", `${fixtureName}.json`);

            const content = fs.readFileSync(fixturePath, "utf-8");

            const fixture = JSON.parse(content) as DocsV2Read.LoadDocsForUrlResponse;

            const urls = getNavigationRoot(
                slug.split("/"),
                fixture.baseUrl.basePath,
                fixture.definition.config.navigation,
                fixture.definition.apis,
                {},
                fixture.baseUrl.domain,
            );

            expect(stripForSnapshot(urls)).toMatchSnapshot();
        });
    });
}

function stripForSnapshot(obj: ReturnType<typeof getNavigationRoot>): unknown {
    if (obj == null || obj.type === "redirect") {
        return obj;
    }

    // only test the tab index, version index, and current node
    return {
        type: obj.type,
        found: {
            currentTabIndex: obj.found.currentTabIndex,
            currentVersionIndex: obj.found.currentVersionIndex,
            currentNode: obj.found.currentNode,
        },
    };
}
