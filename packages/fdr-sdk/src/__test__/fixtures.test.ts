import isPlainObject from "@fern-ui/core-utils/isPlainObject";
import fs from "fs";
import path from "path";
import { FernNavigation } from "..";
import { ApiDefinitionV1ToLatest } from "../api-definition/migrators/v1ToV2";
import { NodeCollector } from "../navigation/NodeCollector";
import { FernNavigationV1ToLatest } from "../navigation/migrators/v1ToV2";
import { collectPageIds } from "../navigation/utils/collectPageIds";
import { readFixture } from "./readFixtures";

const fixturesDir = path.join(__dirname, "fixtures");

function testNavigationConfigConverter(fixtureName: string): void {
    const fixture = readFixture(fixtureName);
    const v1 = FernNavigation.V1.toRootNode(fixture);
    const latest = FernNavigationV1ToLatest.create().root(v1);

    // eslint-disable-next-line vitest/valid-title
    describe(fixtureName, () => {
        const collector = new NodeCollector(latest);

        it("gets all urls from docs config", async () => {
            expect(JSON.stringify(sortObject(latest), undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/node.json`,
            );

            const orphanedNodes = collector.getOrphanedNodes().map((node) => ({
                id: node.id,
                type: node.type,
                title: node.title,
                slug: node.slug,
            }));
            expect(JSON.stringify(sortObject(orphanedNodes), undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/orphanedNodes.json`,
            );

            const orphanedNodesWithContent = collector.getOrphanedPages();
            expect(JSON.stringify(sortObject(orphanedNodesWithContent), undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/orphanedNodesWithContent.json`,
            );

            expect(JSON.stringify(collector.slugs, undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/slugs.json`,
            );

            expect(JSON.stringify(collector.pageSlugs, undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/slugs-pages.json`,
            );

            expect(JSON.stringify(collector.indexablePageSlugs, undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/slugs-sitemap.json`,
            );

            const pageIds = collectPageIds(latest);
            expect(JSON.stringify([...pageIds], undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/pageIds.json`,
            );

            expect(JSON.stringify(sortObject(collector.getVersionNodes()), undefined, 2)).toMatchFileSnapshot(
                `output/${fixtureName}/versionNodes.json`,
            );

            expect(
                JSON.stringify(
                    Object.values(fixture.definition.apis).map((api) =>
                        ApiDefinitionV1ToLatest.from(api, {
                            useJavaScriptAsTypeScript: false,
                            alwaysEnableJavaScriptFetch: false,
                            usesApplicationJsonInFormDataValue: false,
                        }).migrate(),
                    ),
                    undefined,
                    2,
                ),
            ).toMatchFileSnapshot(`output/${fixtureName}/apiDefinitions.json`);
        });

        it("should have unique canonical urls for each page", () => {
            const visitedPageIds = new Set<string>();
            collector.indexablePageSlugs.forEach((slug) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const node = collector.slugMap.get(slug)!;
                expect(node).toBeDefined();
                expect(FernNavigation.isPage(node)).toBe(true);
                expect(node.hidden).not.toBe(true);

                if (!FernNavigation.isPage(node)) {
                    return;
                }

                if (FernNavigation.hasMarkdown(node)) {
                    expect(node.noindex).not.toBe(true);
                }

                const pageId = FernNavigation.getPageId(node);
                if (pageId != null) {
                    expect(visitedPageIds.has(pageId)).toBe(false);
                    visitedPageIds.add(pageId);
                }

                if (node.type === "endpoint") {
                    const pageId = `${node.apiDefinitionId}-${node.endpointId}`;
                    expect(visitedPageIds.has(pageId)).toBe(false);
                    visitedPageIds.add(pageId);
                }

                if (node.type === "webSocket") {
                    const pageId = `${node.apiDefinitionId}-${node.webSocketId}`;
                    expect(visitedPageIds.has(pageId)).toBe(false);
                    visitedPageIds.add(pageId);
                }

                if (node.type === "webhook") {
                    const pageId = `${node.apiDefinitionId}-${node.webhookId}`;
                    expect(visitedPageIds.has(pageId)).toBe(false);
                    visitedPageIds.add(pageId);
                }
            });
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