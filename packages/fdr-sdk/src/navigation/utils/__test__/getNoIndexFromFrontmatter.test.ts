import { getNoIndexFromFrontmatter } from "../getNoIndexFromFrontmatter";

describe("getNoIndexFromFrontmatter", () => {
    it("should return true if noindex is true", () => {
        const markdown = `---
noindex: true
---

# Hello World`;
        expect(getNoIndexFromFrontmatter(markdown)).toBe(true);
    });

    it("should return false if noindex is false", () => {
        const markdown = `---
noindex: false
---

# Hello World`;
        expect(getNoIndexFromFrontmatter(markdown)).toBe(false);
    });

    it("should return undefined if frontmatter is not present", () => {
        const markdown = "# hello world!";

        expect(getNoIndexFromFrontmatter(markdown)).toBe(undefined);
    });

    it("should parse noindex if there are no spaces between the key and value", () => {
        const markdown = `---
noindex:true
---`;

        expect(getNoIndexFromFrontmatter(markdown)).toBe(true);
    });

    it("should parse noindex if there are too many spaces between the key and value", () => {
        const markdown = `---
    noindex:    true
---`;

        expect(getNoIndexFromFrontmatter(markdown)).toBe(true);
    });

    it("should return undefined if noindex is not present", () => {
        const markdown = `---
title: Hello World
---

# Hello World`;

        expect(getNoIndexFromFrontmatter(markdown)).toBe(undefined);
    });

    it("should ignore frontmatter that is not at the beginning of the file", () => {
        const markdown = `# Hello World
---
noindex: true
---`;

        expect(getNoIndexFromFrontmatter(markdown)).toBe(undefined);
    });

    it("should return undefined if noindex is not a boolean", () => {
        const markdown = `---
noindex: hello
---`;

        expect(getNoIndexFromFrontmatter(markdown)).toBe(undefined);
    });

    it("should return undefined if frontmatter is malformed", () => {
        const markdown = `---
noindex: true

# Hello World
`;

        expect(getNoIndexFromFrontmatter(markdown)).toBe(undefined);
    });
});
