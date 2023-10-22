import { PathResolver } from "../../PathResolver";
import { DEFINITION_UNVERSIONED_TABBED } from "./mock-definitions/unversioned-tabbed";
import { DEFINITION_UNVERSIONED_UNTABBED } from "./mock-definitions/unversioned-untabbed";
import { DEFINITION_UNVERSIONED_WITH_SKIPPED_SLUGS } from "./mock-definitions/unversioned-with-skipped-slugs";
import { DEFINITION_VERSIONED_TABBED } from "./mock-definitions/versioned-tabbed";
import { DEFINITION_VERSIONED_UNTABBED } from "./mock-definitions/versioned-untabbed";
import { DEFINITION_WITH_API } from "./mock-definitions/with-api-definition";
import { DEFINITION_WITH_POINTS_TO } from "./mock-definitions/with-points-to";

describe("getAllSlugs", () => {
    describe("correctly returns all slugs", () => {
        it("with unversioned and untabbed docs", () => {
            const resolver = new PathResolver({
                definition: DEFINITION_UNVERSIONED_UNTABBED,
            });
            const expectedSlugs = new Set([
                "",
                "introduction",
                "introduction/authentication",
                "introduction/getting-started",
            ]);
            const actualSlugs = new Set(resolver.getAllSlugs());
            expect(actualSlugs).toEqual(expectedSlugs);
        });

        it("with unversioned and tabbed docs", () => {
            const resolver = new PathResolver({
                definition: DEFINITION_UNVERSIONED_TABBED,
            });
            const expectedSlugs = new Set([
                "",
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

        it("with versioned and untabbed docs", () => {
            const resolver = new PathResolver({
                definition: DEFINITION_VERSIONED_UNTABBED,
            });
            const expectedSlugs = new Set([
                "",
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

        it("with versioned and tabbed docs", () => {
            const resolver = new PathResolver({
                definition: DEFINITION_VERSIONED_TABBED,
            });
            const expectedSlugs = new Set([
                "",
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

        it("with api definition", () => {
            const resolver = new PathResolver({
                definition: DEFINITION_WITH_API,
            });
            const expectedSlugs = new Set([
                "",
                // Markdown
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
                // API
                "api-reference",
                "api-reference/client-api",
                "api-reference/client-api/generate-completion",
                "api-reference/client-api/delete-completion",
                "api-reference/client-api/agents",
                "api-reference/client-api/agents/create-agent",
                "api-reference/client-api/agents/update-agent",
            ]);
            const actualSlugs = new Set(resolver.getAllSlugs());
            expect(actualSlugs).toEqual(expectedSlugs);
        });

        it("with skipped slugs", () => {
            const resolver = new PathResolver({
                definition: DEFINITION_UNVERSIONED_WITH_SKIPPED_SLUGS,
            });
            const expectedSlugs = new Set([
                "",
                // Markdown
                "help-center",
                "help-center/uploading-documents",
                "help-center/deleting-documents",
                // API
                "api-reference",
                "api-reference/generate-completion",
                "api-reference/delete-completion",
                "api-reference/agents",
                "api-reference/agents/create-agent",
                "api-reference/agents/update-agent",
            ]);
            const actualSlugs = new Set(resolver.getAllSlugs());
            expect(actualSlugs).toEqual(expectedSlugs);
        });

        it("with the 'pointsTo' option", () => {
            const resolver = new PathResolver({
                definition: DEFINITION_WITH_POINTS_TO,
            });
            const expectedSlugs = new Set([
                "",
                "introduction",
                "introduction/authentication",
                "introduction/getting-started",
                "api-reference",
                "api-reference/new-sub",
                "api-reference/new-sub/create-agent",
                "api-reference/new-sub/update-agent",
            ]);
            const actualSlugs = new Set(resolver.getAllSlugs());
            expect(actualSlugs).toEqual(expectedSlugs);
        });
    });
});

describe("getAllSlugs with base path /docs", () => {
    describe("correctly returns all slugs", () => {
        it("with unversioned and untabbed docs", () => {
            const resolver = new PathResolver({
                definition: { ...DEFINITION_UNVERSIONED_UNTABBED, basePath: "/docs" },
            });
            const expectedSlugs = new Set([
                "docs",
                "docs/introduction",
                "docs/introduction/authentication",
                "docs/introduction/getting-started",
            ]);
            const actualSlugs = new Set(resolver.getAllSlugs());
            expect(actualSlugs).toEqual(expectedSlugs);
        });

        it("with unversioned and tabbed docs", () => {
            const resolver = new PathResolver({
                definition: { ...DEFINITION_UNVERSIONED_TABBED, basePath: "/docs" },
            });
            const expectedSlugs = new Set([
                "docs",
                "docs/welcome",
                "docs/welcome/introduction",
                "docs/welcome/introduction/authentication",
                "docs/welcome/introduction/getting-started",
                "docs/welcome/advanced-concepts",
                "docs/welcome/advanced-concepts/streaming",
                "docs/welcome/advanced-concepts/sharding",
                "docs/help-center",
                "docs/help-center/documents",
                "docs/help-center/documents/uploading-documents",
                "docs/help-center/documents/deleting-documents",
            ]);
            const actualSlugs = new Set(resolver.getAllSlugs());
            expect(actualSlugs).toEqual(expectedSlugs);
        });

        it("with versioned and untabbed docs", () => {
            const resolver = new PathResolver({
                definition: { ...DEFINITION_VERSIONED_UNTABBED, basePath: "/docs" },
            });
            const expectedSlugs = new Set([
                "docs",
                // Default version
                "docs/introduction",
                "docs/introduction/getting-started",
                "docs/introduction/authentication",
                "docs/introduction/changelog",
                // v2
                "docs/v2",
                "docs/v2/introduction",
                "docs/v2/introduction/getting-started",
                "docs/v2/introduction/authentication",
                "docs/v2/introduction/changelog",
                // v1.2
                "docs/v1-2",
                "docs/v1-2/introduction",
                "docs/v1-2/introduction/getting-started",
                "docs/v1-2/introduction/authentication",
            ]);
            const actualSlugs = new Set(resolver.getAllSlugs());
            expect(actualSlugs).toEqual(expectedSlugs);
        });

        it("with versioned and tabbed docs", () => {
            const resolver = new PathResolver({
                definition: { ...DEFINITION_VERSIONED_TABBED, basePath: "/docs" },
            });
            const expectedSlugs = new Set([
                "docs",
                // Default version
                "docs/welcome",
                "docs/welcome/introduction",
                "docs/welcome/introduction/authentication",
                "docs/welcome/introduction/getting-started",
                "docs/welcome/advanced-concepts",
                "docs/welcome/advanced-concepts/streaming",
                "docs/welcome/advanced-concepts/sharding",
                "docs/help-center",
                "docs/help-center/documents",
                "docs/help-center/documents/uploading-documents",
                "docs/help-center/documents/deleting-documents",
                // v2
                "docs/v2",
                "docs/v2/welcome",
                "docs/v2/welcome/introduction",
                "docs/v2/welcome/introduction/authentication",
                "docs/v2/welcome/introduction/getting-started",
                "docs/v2/welcome/advanced-concepts",
                "docs/v2/welcome/advanced-concepts/streaming",
                "docs/v2/welcome/advanced-concepts/sharding",
                "docs/v2/help-center",
                "docs/v2/help-center/documents",
                "docs/v2/help-center/documents/uploading-documents",
                "docs/v2/help-center/documents/deleting-documents",
                // v1.2
                "docs/v1-2",
                "docs/v1-2/welcome",
                "docs/v1-2/welcome/introduction",
                "docs/v1-2/welcome/introduction/getting-started",
                "docs/v1-2/welcome/advanced-concepts",
                "docs/v1-2/welcome/advanced-concepts/streaming",
                "docs/v1-2/welcome/advanced-concepts/sharding",
                "docs/v1-2/help-center",
                "docs/v1-2/help-center/documents",
                "docs/v1-2/help-center/documents/uploading-documents",
                "docs/v1-2/help-center/documents/deleting-documents",
            ]);
            const actualSlugs = new Set(resolver.getAllSlugs());
            expect(actualSlugs).toEqual(expectedSlugs);
        });

        it("with api definition", () => {
            const resolver = new PathResolver({
                definition: { ...DEFINITION_WITH_API, basePath: "/docs" },
            });
            const expectedSlugs = new Set([
                "docs",
                // Markdown
                "docs/welcome",
                "docs/welcome/introduction",
                "docs/welcome/introduction/authentication",
                "docs/welcome/introduction/getting-started",
                "docs/welcome/advanced-concepts",
                "docs/welcome/advanced-concepts/streaming",
                "docs/welcome/advanced-concepts/sharding",
                "docs/help-center",
                "docs/help-center/documents",
                "docs/help-center/documents/uploading-documents",
                "docs/help-center/documents/deleting-documents",
                // API
                "docs/api-reference",
                "docs/api-reference/client-api",
                "docs/api-reference/client-api/generate-completion",
                "docs/api-reference/client-api/delete-completion",
                "docs/api-reference/client-api/agents",
                "docs/api-reference/client-api/agents/create-agent",
                "docs/api-reference/client-api/agents/update-agent",
            ]);
            const actualSlugs = new Set(resolver.getAllSlugs());
            expect(actualSlugs).toEqual(expectedSlugs);
        });

        it("with skipped slugs", () => {
            const resolver = new PathResolver({
                definition: { ...DEFINITION_UNVERSIONED_WITH_SKIPPED_SLUGS, basePath: "/docs" },
            });
            const expectedSlugs = new Set([
                "docs",
                // Markdown
                "docs/help-center",
                "docs/help-center/uploading-documents",
                "docs/help-center/deleting-documents",
                // API
                "docs/api-reference",
                "docs/api-reference/generate-completion",
                "docs/api-reference/delete-completion",
                "docs/api-reference/agents",
                "docs/api-reference/agents/create-agent",
                "docs/api-reference/agents/update-agent",
            ]);
            const actualSlugs = new Set(resolver.getAllSlugs());
            expect(actualSlugs).toEqual(expectedSlugs);
        });

        it("with the 'pointsTo' option", () => {
            const resolver = new PathResolver({
                definition: { ...DEFINITION_WITH_POINTS_TO, basePath: "/docs" },
            });
            const expectedSlugs = new Set([
                "docs",
                "docs/introduction",
                "docs/introduction/authentication",
                "docs/introduction/getting-started",
                "docs/api-reference",
                "docs/api-reference/new-sub",
                "docs/api-reference/new-sub/create-agent",
                "docs/api-reference/new-sub/update-agent",
            ]);
            const actualSlugs = new Set(resolver.getAllSlugs());
            expect(actualSlugs).toEqual(expectedSlugs);
        });
    });
});
