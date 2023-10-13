import { PathResolver } from "../../PathResolver";
import { expectPageNode } from "../util";
import { DEFINITION_UNVERSIONED_TABBED } from "./mock-definitions/unversioned-tabbed";
import { DEFINITION_UNVERSIONED_UNTABBED } from "./mock-definitions/unversioned-untabbed";

describe("getNeighbors", () => {
    describe("finds the correct neighbors", () => {
        it("with unversioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_UNTABBED,
            });
            const navigatable1 = resolver.resolveSlug("introduction/getting-started");
            const navigatable2 = resolver.resolveSlug("introduction/authentication");
            expectPageNode(navigatable1);
            expectPageNode(navigatable2);

            const neighborsOf1 = resolver.getNeighborsForNavigatable(navigatable1);
            expect(neighborsOf1.previous).toBeNull();
            expect(Object.is(neighborsOf1.next, navigatable2)).toBeTruthy();

            const neighborsOf2 = resolver.getNeighborsForNavigatable(navigatable2);
            expect(Object.is(neighborsOf2.previous, navigatable1)).toBeTruthy();
            expect(neighborsOf2.next).toBeNull();
        });

        it("with unversioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_TABBED,
            });
            const navigatable0 = resolver.resolveSlug("welcome/introduction/authentication");
            const navigatable1 = resolver.resolveSlug("welcome/advanced-concepts/streaming");
            const navigatable2 = resolver.resolveSlug("welcome/advanced-concepts/sharding");
            expectPageNode(navigatable0);
            expectPageNode(navigatable1);
            expectPageNode(navigatable2);

            const neighborsOf1 = resolver.getNeighborsForNavigatable(navigatable1);
            expect(Object.is(neighborsOf1.previous, navigatable0)).toBeTruthy();
            expect(Object.is(neighborsOf1.next, navigatable2)).toBeTruthy();

            const neighborsOf2 = resolver.getNeighborsForNavigatable(navigatable2);
            expect(Object.is(neighborsOf2.previous, navigatable1)).toBeTruthy();
            expect(neighborsOf2.next).toBeNull();
        });

        // TODO: Add more tests
    });
});
