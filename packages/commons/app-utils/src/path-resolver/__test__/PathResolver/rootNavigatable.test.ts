import { PathResolver } from "../../PathResolver";
import { expectPageNode } from "../util";
import { DEFINITION_UNVERSIONED_TABBED } from "./mock-definitions/unversioned-tabbed";
import { DEFINITION_UNVERSIONED_UNTABBED } from "./mock-definitions/unversioned-untabbed";
import { DEFINITION_VERSIONED_TABBED } from "./mock-definitions/versioned-tabbed";
import { DEFINITION_VERSIONED_UNTABBED } from "./mock-definitions/versioned-untabbed";
import { DEFINITION_WITH_API } from "./mock-definitions/with-api-definition";

describe("rootNavigatable", () => {
    describe("returns the correct root navigatable", () => {
        it("with unversioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_UNTABBED,
            });
            const resolvedNode = resolver.rootNavigatable;
            expectPageNode(resolvedNode);
            expect(resolvedNode.leadingSlug).toEqual("introduction/getting-started");
        });

        it("with unversioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_TABBED,
            });
            const resolvedNode = resolver.rootNavigatable;
            expectPageNode(resolvedNode);
            expect(resolvedNode.leadingSlug).toEqual("welcome/introduction/getting-started");
        });

        it("with versioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_VERSIONED_UNTABBED,
            });
            const resolvedNode = resolver.rootNavigatable;
            expectPageNode(resolvedNode);
            expect(resolvedNode.leadingSlug).toEqual("introduction/getting-started");
        });

        it("with versioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_VERSIONED_TABBED,
            });
            const resolvedNode = resolver.rootNavigatable;
            expectPageNode(resolvedNode);
            expect(resolvedNode.leadingSlug).toEqual("welcome/introduction/getting-started");
        });

        it("with api definition", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_WITH_API,
            });
            const resolvedNode = resolver.rootNavigatable;
            expectPageNode(resolvedNode);
            expect(resolvedNode.leadingSlug).toEqual("welcome/introduction/getting-started");
        });
    });
});
