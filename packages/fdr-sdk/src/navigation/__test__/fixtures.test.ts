import fs from "fs";
import path from "path";
import { FernNavigation } from "../..";
import { isPlainObject } from "../../utils";
import { NodeCollector } from "../NodeCollector";
import { FernNavigationV1ToLatest } from "../migrators/v1ToV2";
import { collectPageIds } from "../utils/collectPageIds";
import { readFixture } from "./readFixtures";

const fixturesDir = path.join(__dirname, "fixtures");

function testNavigationConfigConverter(fixtureName: string): void {
    const fixture = readFixture(fixtureName);
    const v1 = FernNavigation.V1.toRootNode(fixture);
    const latest = FernNavigationV1ToLatest.create().root(v1);

    // eslint-disable-next-line vitest/valid-title
    describe(fixtureName, () => {
        const slugCollector = new NodeCollector(latest);

        it("gets all urls from docs config", async () => {
            expect(JSON.stringify(sortObject(latest), undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/node.json`,
            );

            const orphanedNodes = slugCollector.getOrphanedNodes().map((node) => ({
                id: node.id,
                type: node.type,
                title: node.title,
                slug: node.slug,
            }));
            expect(JSON.stringify(sortObject(orphanedNodes), undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/orphanedNodes.json`,
            );

            const orphanedNodesWithContent = slugCollector.getOrphanedPages();
            expect(JSON.stringify(sortObject(orphanedNodesWithContent), undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/orphanedNodesWithContent.json`,
            );

            const slugs = slugCollector.getSlugs();
            expect(JSON.stringify(slugs, undefined, 2)).toMatchFileSnapshot(`output/${fixtureName}/slugs.json`);

            const slugsWithContent = slugCollector.getPageSlugs();
            expect(JSON.stringify(slugsWithContent, undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/slugsWithContent.json`,
            );

            const pageIds = collectPageIds(latest);
            expect(JSON.stringify([...pageIds], undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/pageIds.json`,
            );

            expect(JSON.stringify(sortObject(slugCollector.getVersionNodes()), undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/versionNodes.json`,
            );
        });
    });
}

fs.readdirSync(fixturesDir).forEach((fixtureName) => {
    if (fixtureName.endsWith(".json")) {
        testNavigationConfigConverter(fixtureName.replace(".json", ""));
    }
});

function sortObject(object: unknown): unknown {
    //Thanks > http://whitfin.io/sorting-object-recursively-node-jsjavascript/
    if (!object) {
        return object;
    }

    const isArray = object instanceof Array;
    let sortedObj: Record<string, unknown> | unknown[] = {};
    if (isArray) {
        sortedObj = object.map((item) => sortObject(item));
    } else if (isPlainObject(object)) {
        const keys = Object.keys(object);
        // console.log(keys);
        keys.sort(function (key1, key2) {
            (key1 = key1.toLowerCase()), (key2 = key2.toLowerCase());
            if (key1 < key2) {
                return -1;
            }
            if (key1 > key2) {
                return 1;
            }
            return 0;
        });

        for (const index in keys) {
            const key = keys[index];
            if (key) {
                if (typeof object[key] === "object") {
                    sortedObj[key] = sortObject(object[key]);
                } else {
                    sortedObj[key] = object[key];
                }
            }
        }
    }

    return sortedObj;
}
