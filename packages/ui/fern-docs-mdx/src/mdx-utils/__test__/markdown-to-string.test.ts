import { markdownToString } from "../markdown-to-string.js";

describe("markdownToString", () => {
    it("should strip markdown formatting", () => {
        const result = markdownToString("# Hello, world!");
        expect(result).toBe("Hello, world!");

        const result2 = markdownToString("## Hello, world!");
        expect(result2).toBe("Hello, world!");

        const result3 = markdownToString("```\nconsole.log('Hello, world!');\n```");
        expect(result3).toBe("console.log('Hello, world!');");

        const result4 = markdownToString("<div>Hello, world! <span>foo</span></div>");
        expect(result4).toBe("Hello, world! foo");
    });
});
