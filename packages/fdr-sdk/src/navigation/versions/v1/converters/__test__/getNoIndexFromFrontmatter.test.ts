import { getNoIndexFromFrontmatter } from "../../../../utils/getNoIndexFromFrontmatter";

describe("getNoIndexFromFrontmatter", () => {
    it("should return true if noindex is true", () => {
        const frontmatter = `
noindex: true
`;
        expect(getNoIndexFromFrontmatter(frontmatter)).toBe(true);
    });

    it("should return false if noindex is false", () => {
        const frontmatter = `
noindex: false
`;
        expect(getNoIndexFromFrontmatter(frontmatter)).toBe(false);
    });

    it("should return undefined if frontmatter is not present", () => {
        const frontmatter = "# hello world!";

        expect(getNoIndexFromFrontmatter(frontmatter)).toBe(undefined);
    });

    it("should parse noindex if there are no spaces between the key and value", () => {
        const frontmatter = `
noindex:true
`;

        expect(getNoIndexFromFrontmatter(frontmatter)).toBe(true);
    });

    it("should parse noindex if there are too many spaces between the key and value", () => {
        const frontmatter = `
    noindex:    true
`;

        expect(getNoIndexFromFrontmatter(frontmatter)).toBe(true);
    });

    it("should return undefined if noindex is not present", () => {
        const frontmatter = `
title: Hello World
`;

        expect(getNoIndexFromFrontmatter(frontmatter)).toBe(undefined);
    });

    it("should return undefined if noindex is not a boolean", () => {
        const frontmatter = `
noindex: hello
`;

        expect(getNoIndexFromFrontmatter(frontmatter)).toBe(undefined);
    });
});
