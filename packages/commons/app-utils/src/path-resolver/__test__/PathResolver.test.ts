import { PathResolver } from "../PathResolver";
import { DEFINITION_UNVERSIONED_UNTABBED } from "./mock-definitions/unversioned-untabbed";

describe("PathResolver", () => {
    describe("with unversioned and untabbed docs", () => {
        describe("getAllSlugs", () => {
            it("correctly returns all slugs", () => {
                const resolver = new PathResolver({
                    docsDefinition: DEFINITION_UNVERSIONED_UNTABBED,
                });
                const expectedSlugs = ["introduction", "introduction/authentication", "introduction/getting-started"];
                const actualSlugs = resolver.getAllSlugs().sort();
                expect(actualSlugs).toEqual(expectedSlugs);
            });
        });

        describe("resolveSlug", () => {
            it("resolves slug to the correct node", () => {
                const resolver = new PathResolver({
                    docsDefinition: DEFINITION_UNVERSIONED_UNTABBED,
                });
                const resolvedNode = resolver.resolveSlug("introduction");
                expect(resolvedNode?.type).toEqual("section");
            });
        });
    });
});
