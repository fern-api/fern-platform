import { PathResolver } from "../../PathResolver";
import { expectNode } from "../util";
import { DEFINITION_UNVERSIONED_TABBED } from "./mock-definitions/unversioned-tabbed";
import { DEFINITION_UNVERSIONED_UNTABBED } from "./mock-definitions/unversioned-untabbed";
import { DEFINITION_WITH_API } from "./mock-definitions/with-api-definition";

describe("resolveSlug", () => {
    describe("resolves slug to the correct node", () => {
        it("with unversioned and untabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_UNTABBED,
            });
            const resolvedNode = resolver.resolveSlug("introduction");
            expectNode(resolvedNode).toBeOfType("docs-section");
        });

        it("with unversioned and tabbed docs", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_UNVERSIONED_TABBED,
            });
            const resolvedNode = resolver.resolveSlug("help-center/documents/deleting-documents");
            expectNode(resolvedNode).toBeOfType("page");
        });

        it("with api definition", () => {
            const resolver = new PathResolver({
                docsDefinition: DEFINITION_WITH_API,
            });
            const resolvedNode = resolver.resolveSlug("api-reference/client-api/generate-completion");
            expectNode(resolvedNode).toBeOfType("endpoint");
        });
    });
});
