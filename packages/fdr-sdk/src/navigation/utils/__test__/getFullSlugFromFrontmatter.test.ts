import { getFullSlugFromFrontmatter } from "../getFullSlugFromFrontmatter";

describe("getFullSlugFromFrontmatter", () => {
    it("should return the full slug if it's present", () => {
        const frontmatter = `
slug: a/b/c
`;
        expect(getFullSlugFromFrontmatter(frontmatter)).toEqual("a/b/c");
    });

    it("should strip quotes from the slug", () => {
        const frontmatter = `
slug: "path1/3/sdk-s/version-12"
`;
        expect(getFullSlugFromFrontmatter(frontmatter)).toEqual("path1/3/sdk-s/version-12");
    });

    it("should strip leading and trailing slashes from the slug", () => {
        const frontmatter = `
slug: /a-path/to/some/thing/
`;
        expect(getFullSlugFromFrontmatter(frontmatter)).toEqual("a-path/to/some/thing");
    });

    it("should return undefined if slug is not present", () => {
        const frontmatter = `
title: Hello World
`;

        expect(getFullSlugFromFrontmatter(frontmatter)).toBe(undefined);
    });

    it("should return only the slug if there are other keys", () => {
        const frontmatter = `
title: Hello World
slug: docs
another: key
`;

        expect(getFullSlugFromFrontmatter(frontmatter)).toEqual("docs");
    });

    it("should return an empty string if slug is /", () => {
        const frontmatter = `
slug: /
`;

        expect(getFullSlugFromFrontmatter(frontmatter)).toEqual("");
    });
});
