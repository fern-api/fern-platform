import { PathResolver } from "../../PathResolver";
import { DocsNodeType } from "../../types";
import { DEFINITION_UNVERSIONED_TABBED } from "./mock-definitions/unversioned-tabbed";
import { DEFINITION_UNVERSIONED_UNTABBED } from "./mock-definitions/unversioned-untabbed";
import { DEFINITION_UNVERSIONED_WITH_SKIPPED_SLUGS } from "./mock-definitions/unversioned-with-skipped-slugs";
import { DEFINITION_VERSIONED_TABBED } from "./mock-definitions/versioned-tabbed";
import { DEFINITION_VERSIONED_UNTABBED } from "./mock-definitions/versioned-untabbed";
import { DEFINITION_WITH_API } from "./mock-definitions/with-api-definition";
import { DEFINITION_WITH_COLLIDING_SLUGS } from "./mock-definitions/with-colliding-slugs";
import { DEFINITION_WITH_POINTS_TO } from "./mock-definitions/with-points-to";

describe("getAllSlugs", () => {
    describe("correctly finds no collisions", () => {
        it("with unversioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_UNTABBED,
            });
            expect(resolver.getCollisions().size).toEqual(0);
        });

        it("with unversioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_TABBED,
            });
            expect(resolver.getCollisions().size).toEqual(0);
        });

        it("with versioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_VERSIONED_UNTABBED,
            });
            expect(resolver.getCollisions().size).toEqual(0);
        });

        it("with versioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_VERSIONED_TABBED,
            });
            expect(resolver.getCollisions().size).toEqual(0);
        });

        it("with api definition", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_WITH_API,
            });
            expect(resolver.getCollisions().size).toEqual(0);
        });

        it("with skipped slugs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_WITH_SKIPPED_SLUGS,
            });
            expect(resolver.getCollisions().size).toEqual(0);
        });

        it("with the 'pointsTo' option", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_WITH_POINTS_TO,
            });
            expect(resolver.getCollisions().size).toEqual(0);
        });
    });

    describe("correctly finds all collisions", () => {
        it("with colliding slugs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_WITH_COLLIDING_SLUGS,
            });
            type SlugNodeListTuple = [string, DocsNodeType[]];
            const expectedCollisions: SlugNodeListTuple[] = [
                ["v1", ["tab", "version"]],
                ["v1/introduction", ["docs-section", "tab"]],
                ["v1/introduction/getting-started", ["page", "page"]],
            ];
            const actualCollisions: SlugNodeListTuple[] = Array.from(resolver.getCollisions().entries()).map(
                ([slug, nodes]) => [slug, nodes.map((node) => node.type).sort()]
            );
            expect(actualCollisions).toEqual(expectedCollisions);
        });
    });
});
