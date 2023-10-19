import { joinUrlSlugs } from "../slug";

describe("joinUrlSlugs", () => {
    it("correctly joins url slugs", () => {
        const expectedSlugs = ["", "a", "a/b", "a/b/c", "b/c", "a/c", "a/b", "a/b/c"];
        const actualSlugs = [
            joinUrlSlugs(""),
            joinUrlSlugs("a"),
            joinUrlSlugs("a", "b"),
            joinUrlSlugs("a", "b", "c"),
            joinUrlSlugs("", "b", "c"),
            joinUrlSlugs("a", "", "c"),
            joinUrlSlugs("a", "b", ""),
            joinUrlSlugs("", "a", "", "", "b", "", "c"),
        ];

        expect(new Set(actualSlugs)).toEqual(new Set(expectedSlugs));
    });

    it("correctly handles leading and trailing slashes", () => {
        const expectedSlugs = ["abc/def", "abc/def", "/abc/def", "/abc/def"];
        const actualSlugs = [
            joinUrlSlugs("abc/", "def"),
            joinUrlSlugs("abc/", "def/"),
            joinUrlSlugs("/abc/", "def/"),
            joinUrlSlugs("/abc/", "/def/"),
        ];

        expect(new Set(actualSlugs)).toEqual(new Set(expectedSlugs));
    });
});
