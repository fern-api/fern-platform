import fs from "fs";
import path from "path";
import { DocsV2Read } from "../../client";
import { SlugCollector } from "../SlugCollector";
import { NavigationConfigConverter } from "../converters/NavigationConfigConverter";
import { collectPageIds } from "../utils/collectPageIds";

const fixturesDir = path.join(__dirname, "fixtures");

function testNavigationConfigConverter(fixtureName: string): void {
    // eslint-disable-next-line vitest/valid-title
    describe(fixtureName, () => {
        const fixturePath = path.join(fixturesDir, `${fixtureName}.json`);
        const content = fs.readFileSync(fixturePath, "utf-8");
        const fixture = JSON.parse(content) as DocsV2Read.LoadDocsForUrlResponse;
        const node = NavigationConfigConverter.convert(
            fixture.definition.config.navigation,
            fixture.definition.apis,
            fixture.baseUrl.basePath,
        );

        const slugCollector = new SlugCollector(node);

        it("gets all urls from docs config", async () => {
            expect(JSON.stringify(node, undefined, 2)).toMatchFileSnapshot(`output/${fixtureName}/node.json`);

            const orphanedNodes = slugCollector.getOrphanedNodes();
            expect(JSON.stringify(orphanedNodes, undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/orphanedNodes.json`,
            );

            const orphanedNodesWithContent = slugCollector.getOrphanedNodesWithContent();
            expect(JSON.stringify(orphanedNodesWithContent, undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/orphanedNodesWithContent.json`,
            );

            const slugs = slugCollector.getSlugs();
            expect(JSON.stringify(slugs, undefined, 2)).toMatchFileSnapshot(`output/${fixtureName}/slugs.json`);

            const slugsWithContent = slugCollector.getSlugsWithContent();
            expect(JSON.stringify(slugsWithContent, undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/slugsWithContent.json`,
            );

            const pageIds = collectPageIds(node);
            expect(JSON.stringify([...pageIds], undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/pageIds.json`,
            );
        });
    });
}

fs.readdirSync(fixturesDir).forEach((fixtureName) => {
    if (fixtureName.endsWith(".json")) {
        testNavigationConfigConverter(fixtureName.replace(".json", ""));
    }
});
