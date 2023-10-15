import { joinUrlSlugs } from "../slug";

describe("joinUrlSlugs", () => {
    it("correctly joins url slugs", () => {
        const expectedSlugs = ["", "a", "a/b", "a/b/c", "b/c", "a/c", "a/b", "a/b/c", "a/b%3Fc/d"];
        const actualSlugs = [
            joinUrlSlugs(""),
            joinUrlSlugs("a"),
            joinUrlSlugs("a", "b"),
            joinUrlSlugs("a", "b", "c"),
            joinUrlSlugs("", "b", "c"),
            joinUrlSlugs("a", "", "c"),
            joinUrlSlugs("a", "b", ""),
            joinUrlSlugs("", "a", "", "", "b", "", "c"),
            joinUrlSlugs("a", "b?c", "d"),
        ];

        expect(new Set(expectedSlugs)).toEqual(new Set(actualSlugs));
    });
});
