import { PathResolver } from "../../PathResolver";
import { DEFINITION_UNVERSIONED_TABBED } from "./mock-definitions/unversioned-tabbed";
import { DEFINITION_UNVERSIONED_UNTABBED } from "./mock-definitions/unversioned-untabbed";
import { DEFINITION_VERSIONED_TABBED } from "./mock-definitions/versioned-tabbed";
import { DEFINITION_VERSIONED_UNTABBED } from "./mock-definitions/versioned-untabbed";
import { DEFINITION_WITH_API } from "./mock-definitions/with-api-definition";
import { DEFINITION_WITH_SKIPPED_SLUGS } from "./mock-definitions/with-skipped-slugs";

describe("getAllSlugs", () => {
    describe("correctly returns all slugs", () => {
        it("with unversioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_UNTABBED,
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
                docsDefinition: DEFINITION_UNVERSIONED_TABBED,
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
                docsDefinition: DEFINITION_VERSIONED_UNTABBED,
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
                docsDefinition: DEFINITION_VERSIONED_TABBED,
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
                docsDefinition: DEFINITION_WITH_API,
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
                docsDefinition: DEFINITION_WITH_SKIPPED_SLUGS,
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
    });
});
