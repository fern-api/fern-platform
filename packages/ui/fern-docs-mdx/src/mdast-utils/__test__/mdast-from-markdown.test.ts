import { mdastFromMarkdown } from "../mdast-from-markdown.js";

describe("mdast-from-markdown", () => {
    it("should convert markdown to mdast", () => {
        const mdast = mdastFromMarkdown("Hello world");
        expect(mdast).toMatchSnapshot();
    });

    it("should convert markdown with math to mdast", () => {
        const mdast = mdastFromMarkdown("Hello world $x^2$");
        expect(mdast).toMatchSnapshot();
    });

    it("should convert markdown with flow math to mdast", () => {
        const mdast = mdastFromMarkdown("Hello world \n$$\nx^2\n$$\n");
        expect(mdast).toMatchSnapshot();
    });
});
