import { PathResolver } from "../PathResolver";
import { DEFINITION_UNVERSIONED_TABBED } from "./mock-definitions/unversioned-tabbed";
import { DEFINITION_UNVERSIONED_UNTABBED } from "./mock-definitions/unversioned-untabbed";
import { DEFINITION_VERSIONED_TABBED } from "./mock-definitions/versioned-tabbed";
import { DEFINITION_VERSIONED_UNTABBED } from "./mock-definitions/versioned-untabbed";

describe("PathResolver", () => {
    describe("with unversioned and untabbed docs", () => {
        describe("getAllSlugs", () => {
            it("correctly returns all slugs", () => {
                const resolver = new PathResolver({
                    docsDefinition: DEFINITION_UNVERSIONED_UNTABBED,
                });
                const expectedSlugs = new Set([
                    "introduction",
                    "introduction/authentication",
                    "introduction/getting-started",
                ]);
                const actualSlugs = new Set(resolver.getAllSlugs());
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

    describe("with unversioned and tabbed docs", () => {
        describe("getAllSlugs", () => {
            it("correctly returns all slugs", () => {
                const resolver = new PathResolver({
                    docsDefinition: DEFINITION_UNVERSIONED_TABBED,
                });
                const expectedSlugs = new Set([
                    "welcome",
                    "welcome/introduction",
                    "welcome/introduction/authentication",
                    "welcome/introduction/getting-started",
                    "welcome/advanced-concepts",
                    "welcome/advanced-concepts/streaming",
                    "welcome/advanced-concepts/sharding",
                    "help-center",
                    "help-center/documents",
                    "help-center/documents/uploading-documents",
                    "help-center/documents/deleting-documents",
                ]);
                const actualSlugs = new Set(resolver.getAllSlugs());
                expect(actualSlugs).toEqual(expectedSlugs);
            });
        });
    });

    describe("with versioned and untabbed docs", () => {
        describe("getAllSlugs", () => {
            it("correctly returns all slugs", () => {
                const resolver = new PathResolver({
                    docsDefinition: DEFINITION_VERSIONED_UNTABBED,
                });
                const expectedSlugs = new Set([
                    // Default version
                    "introduction",
                    "introduction/getting-started",
                    "introduction/authentication",
                    "introduction/changelog",
                    // v2
                    "v2",
                    "v2/introduction",
                    "v2/introduction/getting-started",
                    "v2/introduction/authentication",
                    "v2/introduction/changelog",
                    // v1.2
                    "v1-2",
                    "v1-2/introduction",
                    "v1-2/introduction/getting-started",
                    "v1-2/introduction/authentication",
                ]);
                const actualSlugs = new Set(resolver.getAllSlugs());
                expect(actualSlugs).toEqual(expectedSlugs);
            });
        });
    });

    describe("with versioned and tabbed docs", () => {
        describe("getAllSlugs", () => {
            it("correctly returns all slugs", () => {
                const resolver = new PathResolver({
                    docsDefinition: DEFINITION_VERSIONED_TABBED,
                });
                const expectedSlugs = new Set([
                    // Default version
                    "welcome",
                    "welcome/introduction",
                    "welcome/introduction/authentication",
                    "welcome/introduction/getting-started",
                    "welcome/advanced-concepts",
                    "welcome/advanced-concepts/streaming",
                    "welcome/advanced-concepts/sharding",
                    "help-center",
                    "help-center/documents",
                    "help-center/documents/uploading-documents",
                    "help-center/documents/deleting-documents",
                    // v2
                    "v2",
                    "v2/welcome",
                    "v2/welcome/introduction",
                    "v2/welcome/introduction/authentication",
                    "v2/welcome/introduction/getting-started",
                    "v2/welcome/advanced-concepts",
                    "v2/welcome/advanced-concepts/streaming",
                    "v2/welcome/advanced-concepts/sharding",
                    "v2/help-center",
                    "v2/help-center/documents",
                    "v2/help-center/documents/uploading-documents",
                    "v2/help-center/documents/deleting-documents",
                    // v1.2
                    "v1-2",
                    "v1-2/welcome",
                    "v1-2/welcome/introduction",
                    "v1-2/welcome/introduction/getting-started",
                    "v1-2/welcome/advanced-concepts",
                    "v1-2/welcome/advanced-concepts/streaming",
                    "v1-2/welcome/advanced-concepts/sharding",
                    "v1-2/help-center",
                    "v1-2/help-center/documents",
                    "v1-2/help-center/documents/uploading-documents",
                    "v1-2/help-center/documents/deleting-documents",
                ]);
                const actualSlugs = new Set(resolver.getAllSlugs());
                expect(actualSlugs).toEqual(expectedSlugs);
            });
        });
    });
});
