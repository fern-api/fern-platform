import { isUnversionedUntabbedNavigationConfig } from "../../fern";
import { UrlSlugTree } from "../UrlSlugTree";
import { MOCKS_DOCS_DEFINITION } from "./mocks";

describe("UrlSlugTree", () => {
    describe("getAllSlugs", () => {
        it("correctly determines all slugs", () => {
            if (!isUnversionedUntabbedNavigationConfig(MOCKS_DOCS_DEFINITION.config.navigation)) {
                throw new Error("Text relies on an unversioned untabbed navigation config");
            }
            const tree = new UrlSlugTree({
                loadApiDefinition: (id) => MOCKS_DOCS_DEFINITION.apis[id],
                items: MOCKS_DOCS_DEFINITION.config.navigation.items,
            });

            const expectedSlugs = [
                "introduction",
                "introduction/api-responses",
                "introduction/authentication",
                "introduction/getting-started",
                "introduction/idempotency-key",
                "introduction/loyalty-transactions",
            ];
            const actualSlugs = tree.getAllSlugs().sort();

            expect(actualSlugs).toEqual(expectedSlugs);
        });
    });
});
