import { PathResolver } from "../../PathResolver";
import { DEFINITION_UNVERSIONED_UNTABBED } from "./mock-definitions/unversioned-untabbed";

describe("getAllSlugsWithBaseURL", () => {
    describe("correctly returns all slugs with the specified base URL", () => {
        it('with the "https://" prefix', () => {
            const resolver = new PathResolver({
                definition: DEFINITION_UNVERSIONED_UNTABBED,
            });
            const baseUrl = "https://example.com";
            const expectedSlugs = [
                "https://example.com",
                "https://example.com/introduction",
                "https://example.com/introduction/authentication",
                "https://example.com/introduction/getting-started",
            ];
            const actualSlugs = resolver.getAllSlugsWithBaseURL(baseUrl);
            expect(new Set(actualSlugs)).toEqual(new Set(expectedSlugs));
        });

        it('without the "https://" prefix', () => {
            const resolver = new PathResolver({
                definition: DEFINITION_UNVERSIONED_UNTABBED,
            });
            const baseUrl = "example.com";
            const expectedSlugs = [
                "https://example.com",
                "https://example.com/introduction",
                "https://example.com/introduction/authentication",
                "https://example.com/introduction/getting-started",
            ];
            const actualSlugs = resolver.getAllSlugsWithBaseURL(baseUrl);
            expect(new Set(actualSlugs)).toEqual(new Set(expectedSlugs));
        });
    });
});

describe("getAllSlugsWithBaseURL and base path /docs", () => {
    describe("correctly returns all slugs with the specified base URL", () => {
        it('with the "https://" prefix', () => {
            const resolver = new PathResolver({
                definition: { ...DEFINITION_UNVERSIONED_UNTABBED, basePath: "/docs" },
            });
            const baseUrl = "https://example.com";
            const expectedSlugs = [
                "https://example.com/docs",
                "https://example.com/docs/introduction",
                "https://example.com/docs/introduction/authentication",
                "https://example.com/docs/introduction/getting-started",
            ];
            const actualSlugs = resolver.getAllSlugsWithBaseURL(baseUrl);
            expect(new Set(actualSlugs)).toEqual(new Set(expectedSlugs));
        });

        it('without the "https://" prefix', () => {
            const resolver = new PathResolver({
                definition: { ...DEFINITION_UNVERSIONED_UNTABBED, basePath: "/docs" },
            });
            const baseUrl = "example.com";
            const expectedSlugs = [
                "https://example.com/docs",
                "https://example.com/docs/introduction",
                "https://example.com/docs/introduction/authentication",
                "https://example.com/docs/introduction/getting-started",
            ];
            const actualSlugs = resolver.getAllSlugsWithBaseURL(baseUrl);
            expect(new Set(actualSlugs)).toEqual(new Set(expectedSlugs));
        });
    });
});
