import { PathResolver } from "../../PathResolver";
import { expectEndpointNode, expectPageNode } from "../util";
import { DEFINITION_UNVERSIONED_TABBED } from "./mock-definitions/unversioned-tabbed";
import { DEFINITION_UNVERSIONED_UNTABBED } from "./mock-definitions/unversioned-untabbed";
import { DEFINITION_VERSIONED_TABBED } from "./mock-definitions/versioned-tabbed";
import { DEFINITION_VERSIONED_UNTABBED } from "./mock-definitions/versioned-untabbed";
import { DEFINITION_WITH_API } from "./mock-definitions/with-api-definition";

describe("resolveNavigatable", () => {
    describe("resolves to the correct navigatable node", () => {
        it("with unversioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_UNTABBED,
            });
            const resolvedNode = resolver.resolveNavigatable("introduction");
            expectPageNode(resolvedNode);
            expect(resolvedNode.slug).toEqual("getting-started");
        });

        it("with unversioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_TABBED,
            });
            const resolvedNode = resolver.resolveNavigatable("help-center");
            expectPageNode(resolvedNode);
            expect(resolvedNode.slug).toEqual("uploading-documents");
        });

        it("with versioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_VERSIONED_UNTABBED,
            });
            const resolvedNode = resolver.resolveNavigatable("introduction");
            expectPageNode(resolvedNode);
            expect(resolvedNode.slug).toEqual("getting-started");
        });

        it("with versioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_VERSIONED_TABBED,
            });
            const resolvedNode = resolver.resolveNavigatable("v1-2");
            expectPageNode(resolvedNode);
            expect(resolvedNode.slug).toEqual("getting-started");
        });

        it("with api definition", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_WITH_API,
            });
            const resolvedNode = resolver.resolveNavigatable("api-reference");
            expectEndpointNode(resolvedNode);
            expect(resolvedNode.slug).toEqual("generate-completion");
        });
    });
});
