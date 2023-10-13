import { PathCollisionError } from "../../errors";
import { PathResolver } from "../../PathResolver";
import { DocsNodeType, FullSlug } from "../../types";
import { expectDocsSectionNode, expectNode, expectPageNode } from "../util";
import { DEFINITION_UNVERSIONED_TABBED } from "./mock-definitions/unversioned-tabbed";
import { DEFINITION_UNVERSIONED_UNTABBED } from "./mock-definitions/unversioned-untabbed";
import { DEFINITION_UNVERSIONED_WITH_SKIPPED_SLUGS } from "./mock-definitions/unversioned-with-skipped-slugs";
import { DEFINITION_VERSIONED_TABBED } from "./mock-definitions/versioned-tabbed";
import { DEFINITION_VERSIONED_UNTABBED } from "./mock-definitions/versioned-untabbed";
import { DEFINITION_VERSIONED_WITH_SKIPPED_SLUGS } from "./mock-definitions/versioned-with-skipped-slugs";
import { DEFINITION_WITH_API } from "./mock-definitions/with-api-definition";
import { DEFINITION_WITH_COLLIDING_SLUGS } from "./mock-definitions/with-colliding-slugs";
import { DEFINITION_WITH_COLLIDING_SLUGS_2 } from "./mock-definitions/with-colliding-slugs-2";
import { DEFINITION_WITH_POINTS_TO } from "./mock-definitions/with-points-to";

describe("resolveSlug", () => {
    describe("resolves invalid slug to undefined", () => {
        it("with versioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_VERSIONED_UNTABBED,
            });
            const resolvedNode = resolver.resolveSlug("abc");
            expect(resolvedNode).toBeUndefined();
        });
    });

    describe("resolves slug to the correct node", () => {
        it("with unversioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_UNTABBED,
            });
            const resolvedNode = resolver.resolveSlug("introduction");
            expectDocsSectionNode(resolvedNode);
        });

        it("with unversioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_TABBED,
            });
            const resolvedNode = resolver.resolveSlug("help-center/documents/deleting-documents");
            expectPageNode(resolvedNode);
        });

        it("with versioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_VERSIONED_UNTABBED,
            });
            const tuples: [FullSlug, DocsNodeType][] = [
                ["v2/introduction/changelog", "page"],
                ["introduction/changelog", "page"],
                ["v1-2/introduction/authentication", "page"],
            ];
            tuples.forEach(([slug, type]) => {
                const resolvedNode = resolver.resolveSlug(slug);
                expectNode(resolvedNode).toBeOfType(type);
            });
        });

        it("with versioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_VERSIONED_TABBED,
            });
            const tuples: [FullSlug, DocsNodeType][] = [
                ["v2/help-center/documents/deleting-documents", "page"],
                ["help-center/documents/deleting-documents", "page"],
                ["v1-2/welcome/advanced-concepts", "docs-section"],
            ];
            tuples.forEach(([slug, type]) => {
                const resolvedNode = resolver.resolveSlug(slug);
                expectNode(resolvedNode).toBeOfType(type);
            });
        });

        it("with api definition", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_WITH_API,
            });
            const resolvedNode = resolver.resolveSlug("api-reference/client-api/generate-completion");
            expectNode(resolvedNode).toBeOfType("top-level-endpoint");
        });

        describe("with skipped slugs", () => {
            it("case 1: unversioned", () => {
                const resolver = new PathResolver({
                    docsDefinition: DEFINITION_UNVERSIONED_WITH_SKIPPED_SLUGS,
                });
                const tuples: [FullSlug, DocsNodeType | undefined][] = [
                    ["help-center", "tab"],
                    ["help-center/documents", undefined],
                    ["help-center/documents/uploading-documents", undefined],
                    ["help-center/uploading-documents", "page"],
                    ["api-reference/api-reference/generate-completion", undefined],
                    ["api-reference/generate-completion", "top-level-endpoint"],
                ];
                tuples.forEach(([slug, type]) => {
                    const resolvedNode = resolver.resolveSlug(slug);
                    expectNode(resolvedNode).toBeOfType(type);
                });
            });

            it("case 2: versioned", () => {
                const resolver = new PathResolver({
                    docsDefinition: DEFINITION_VERSIONED_WITH_SKIPPED_SLUGS,
                });
                const tuples: [FullSlug, DocsNodeType | undefined][] = [
                    ["v2", "version"],
                    ["v2/introduction", undefined],
                    ["v2/introduction/getting-started", undefined],
                    ["introduction", undefined],
                    ["introduction/getting-started", undefined],
                    ["getting-started", "page"],
                    ["changelog", "page"],
                    ["v1-2", "version"],
                    ["v1-2/getting-started", "page"],
                    ["v1-2/authentication", "page"],
                ];
                tuples.forEach(([slug, type]) => {
                    const resolvedNode = resolver.resolveSlug(slug);
                    expectNode(resolvedNode).toBeOfType(type);
                });
            });
        });

        it("with the 'pointsTo' option", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_WITH_POINTS_TO,
            });
            const nodeForOldSub = resolver.resolveSlug("api-reference/old-sub");
            expectNode(nodeForOldSub).toBeOfType(undefined);

            const nodeForNewSub = resolver.resolveSlug("api-reference/new-sub");
            expectNode(nodeForNewSub).toBeOfType("api-subpackage");
        });

        describe("with collisions", () => {
            it("case 1", () => {
                const resolver = new PathResolver({
                    docsDefinition: DEFINITION_WITH_COLLIDING_SLUGS,
                });
                expect(() => resolver.resolveSlug("v1")).toThrow(PathCollisionError);
                expect(() => resolver.resolveSlug("v1/introduction")).toThrow(PathCollisionError);
                expect(() => resolver.resolveSlug("v1/introduction/getting-started")).toThrow(PathCollisionError);
            });

            it("case 2", () => {
                const resolver = new PathResolver({
                    docsDefinition: DEFINITION_WITH_COLLIDING_SLUGS_2,
                });
                expect(() => resolver.resolveSlug("v1")).toThrow();
                const node1 = resolver.resolveSlug("v1/welcome/getting-started");
                const node2 = resolver.resolveSlug("v1/introduction/getting-started");
                expectPageNode(node1);
                expectPageNode(node2);
                expect(Object.is(node1, node2)).toBeFalsy();
            });
        });
    });
});
