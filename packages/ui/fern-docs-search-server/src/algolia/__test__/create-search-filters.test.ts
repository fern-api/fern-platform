import { createSearchFilters } from "../create-search-filters";

const TEST_DOMAIN = "buildwithfern.com";

describe("create-search-filters", () => {
    it("should create filters for unauthed users", () => {
        expect(createSearchFilters({ domain: TEST_DOMAIN, roles: [], authed: false })).toBe(
            `domain:${TEST_DOMAIN} AND authed:false`,
        );
        expect(createSearchFilters({ domain: TEST_DOMAIN, roles: ["a", "b", "c"], authed: false })).toBe(
            `domain:${TEST_DOMAIN} AND authed:false`,
        );
    });

    it("should include the everyone role in all permutations", () => {
        expect(
            createSearchFilters({ domain: TEST_DOMAIN, roles: ["a", "b", "c"], authed: true }),
        ).toMatchInlineSnapshot(
            '"domain:buildwithfern.com AND (visible_by:role/everyone OR visible_by:role/a OR visible_by:role/a/b OR visible_by:role/a/b/c OR visible_by:role/a/c OR visible_by:role/b OR visible_by:role/b/c OR visible_by:role/c)"',
        );

        expect(
            createSearchFilters({ domain: TEST_DOMAIN, roles: ["c", "b", "a"], authed: true }),
        ).toMatchInlineSnapshot(
            '"domain:buildwithfern.com AND (visible_by:role/everyone OR visible_by:role/a OR visible_by:role/a/b OR visible_by:role/a/b/c OR visible_by:role/a/c OR visible_by:role/b OR visible_by:role/b/c OR visible_by:role/c)"',
        );

        expect(createSearchFilters({ domain: TEST_DOMAIN, roles: [], authed: true })).toMatchInlineSnapshot(
            '"domain:buildwithfern.com AND (visible_by:role/everyone)"',
        );
    });
});
