import { createSearchFilters } from "../create-search-filters";

const TEST_DOMAIN = "buildwithfern.com";

describe("create-search-filters", () => {
    it("should create filters for unauthed users", () => {
        expect(createSearchFilters({ domain: TEST_DOMAIN, roles: [], userRoles: [], authed: false })).toBe(
            `domain:${TEST_DOMAIN} AND authed:false`,
        );
        expect(createSearchFilters({ domain: TEST_DOMAIN, roles: ["a", "b", "c"], userRoles: [], authed: false })).toBe(
            `domain:${TEST_DOMAIN} AND authed:false`,
        );
    });

    it("should include the everyone role in all permutations", () => {
        expect(
            createSearchFilters({
                domain: TEST_DOMAIN,
                roles: ["a", "b", "c"],
                userRoles: ["a", "b", "c"],
                authed: true,
            }),
        ).toMatchInlineSnapshot(
            '"domain:buildwithfern.com AND (visible_by:0 OR visible_by:1 OR visible_by:2 OR visible_by:3 OR visible_by:4 OR visible_by:5 OR visible_by:6 OR visible_by:7)"',
        );

        expect(
            createSearchFilters({
                domain: TEST_DOMAIN,
                roles: ["c", "b", "a"],
                userRoles: ["a", "b", "c"],
                authed: true,
            }),
        ).toMatchInlineSnapshot(
            '"domain:buildwithfern.com AND (visible_by:0 OR visible_by:1 OR visible_by:2 OR visible_by:3 OR visible_by:4 OR visible_by:5 OR visible_by:6 OR visible_by:7)"',
        );

        expect(
            createSearchFilters({
                domain: TEST_DOMAIN,
                roles: ["a", "b", "c"],
                userRoles: ["a", "b"],
                authed: true,
            }),
        ).toMatchInlineSnapshot(
            '"domain:buildwithfern.com AND (visible_by:0 OR visible_by:1 OR visible_by:2 OR visible_by:3)"',
        );

        expect(
            createSearchFilters({ domain: TEST_DOMAIN, roles: [], userRoles: [], authed: true }),
        ).toMatchInlineSnapshot('"domain:buildwithfern.com AND (visible_by:0)"');
    });
});
