import { PathResolver } from "../../PathResolver";
import { expectEndpointNode, expectPageNode, expectTopLevelEndpointNode } from "../util";
import { DEFINITION_UNVERSIONED_TABBED } from "./mock-definitions/unversioned-tabbed";
import { DEFINITION_UNVERSIONED_UNTABBED } from "./mock-definitions/unversioned-untabbed";
import { DEFINITION_VERSIONED_TABBED } from "./mock-definitions/versioned-tabbed";
import { DEFINITION_VERSIONED_UNTABBED } from "./mock-definitions/versioned-untabbed";
import { DEFINITION_WITH_API } from "./mock-definitions/with-api-definition";
import { DEFINITION_WITH_POINTS_TO } from "./mock-definitions/with-points-to";

describe("resolveNavigatable", () => {
    describe("resolves empty slug to root navigatable", () => {
        it("with unversioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_UNTABBED,
            });
            expect(Object.is(resolver.resolveNavigatable(""), resolver.rootNavigatable)).toBe(true);
        });

        it("with unversioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_TABBED,
            });
            expect(Object.is(resolver.resolveNavigatable(""), resolver.rootNavigatable)).toBe(true);
        });

        it("with versioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_VERSIONED_UNTABBED,
            });
            expect(Object.is(resolver.resolveNavigatable(""), resolver.rootNavigatable)).toBe(true);
        });

        it("with versioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_VERSIONED_TABBED,
            });
            expect(Object.is(resolver.resolveNavigatable(""), resolver.rootNavigatable)).toBe(true);
        });

        it("with api definition", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_WITH_API,
            });
            expect(Object.is(resolver.resolveNavigatable(""), resolver.rootNavigatable)).toBe(true);
        });

        it("with the 'pointsTo' option", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_WITH_POINTS_TO,
            });
            expect(Object.is(resolver.resolveNavigatable(""), resolver.rootNavigatable)).toBe(true);
        });
    });

    describe("resolves to the correct navigatable node", () => {
        it("with unversioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_UNTABBED,
            });
            const resolvedNode = resolver.resolveNavigatable("introduction");
            expectPageNode(resolvedNode);
            expect(resolvedNode.slug).toEqual("getting-started");
            expect(resolvedNode.leadingSlug).toEqual("introduction/getting-started");
        });

        it("with unversioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_TABBED,
            });
            const resolvedNode = resolver.resolveNavigatable("help-center");
            expectPageNode(resolvedNode);
            expect(resolvedNode.slug).toEqual("uploading-documents");
            expect(resolvedNode.leadingSlug).toEqual("help-center/documents/uploading-documents");
        });

        it("with versioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_VERSIONED_UNTABBED,
            });
            const resolvedNode = resolver.resolveNavigatable("introduction");
            expectPageNode(resolvedNode);
            expect(resolvedNode.slug).toEqual("getting-started");
            expect(resolvedNode.leadingSlug).toEqual("introduction/getting-started");
        });

        it("with versioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_VERSIONED_TABBED,
            });
            const resolvedNode = resolver.resolveNavigatable("v1-2");
            expectPageNode(resolvedNode);
            expect(resolvedNode.slug).toEqual("getting-started");
            expect(resolvedNode.leadingSlug).toEqual("welcome/introduction/getting-started");
        });

        it("with api definition", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_WITH_API,
            });
            const resolvedNode = resolver.resolveNavigatable("api-reference");
            expectTopLevelEndpointNode(resolvedNode);
            expect(resolvedNode.slug).toEqual("generate-completion");
            expect(resolvedNode.leadingSlug).toEqual("api-reference/client-api/generate-completion");
        });

        it("with the 'pointsTo' option", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_WITH_POINTS_TO,
            });
            const resolvedNode = resolver.resolveNavigatable("api-reference");
            expectEndpointNode(resolvedNode);
            expect(resolvedNode.slug).toEqual("create-agent");
            expect(resolvedNode.leadingSlug).toEqual("api-reference/new-sub/create-agent");
        });
    });
});
