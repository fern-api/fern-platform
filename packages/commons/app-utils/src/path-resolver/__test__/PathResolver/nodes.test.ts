import { PathResolver } from "../../PathResolver";
import { expectDocsSection, expectPageNode } from "../util";
import { DEFINITION_UNVERSIONED_TABBED } from "./mock-definitions/unversioned-tabbed";
import { DEFINITION_UNVERSIONED_UNTABBED } from "./mock-definitions/unversioned-untabbed";
import { DEFINITION_VERSIONED_TABBED } from "./mock-definitions/versioned-tabbed";
import { DEFINITION_VERSIONED_UNTABBED } from "./mock-definitions/versioned-untabbed";

describe("resolveNavigatable", () => {
    describe("correctly gets the section associated with page", () => {
        it("with unversioned and untabbed docs", () => {
            const resolver = new PathResolver({
                definition: DEFINITION_UNVERSIONED_UNTABBED,
            });
            const node = resolver.rootNavigatable;
            expectPageNode(node);
            expectDocsSection(node.section);
            expect(node.section.title).toBe("Introduction");
        });

        it("with unversioned and tabbed docs", () => {
            const resolver = new PathResolver({
                definition: DEFINITION_UNVERSIONED_TABBED,
            });
            const node = resolver.resolveNavigatable("welcome/advanced-concepts/sharding");
            expectPageNode(node);
            expectDocsSection(node.section);
            expect(node.section.title).toBe("Advanced Concepts");
        });

        it("with versioned and untabbed docs", () => {
            const resolver = new PathResolver({
                definition: DEFINITION_VERSIONED_UNTABBED,
            });
            const node = resolver.resolveNavigatable("v1-2/introduction/authentication");
            expectPageNode(node);
            expectDocsSection(node.section);
            expect(node.section.title).toBe("Welcome");
        });

        it("with versioned and tabbed docs", () => {
            const resolver = new PathResolver({
                definition: DEFINITION_VERSIONED_TABBED,
            });
            const node = resolver.resolveNavigatable("help-center/documents/uploading-documents");
            expectPageNode(node);
            expectDocsSection(node.section);
            expect(node.section.title).toBe("Documents");
        });
    });
});
