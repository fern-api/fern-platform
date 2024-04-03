import { createElement } from "react";
import renderer from "react-test-renderer";
import { MdxContent } from "../MdxContent";
import { serializeMdxWithFrontmatter } from "../mdx";

async function renderMdxContent(content: string): Promise<renderer.ReactTestRendererJSON> {
    const serializedContent = await serializeMdxWithFrontmatter(content, { development: true });
    const result = renderer.create(createElement(MdxContent, { mdx: serializedContent })).toJSON();

    assert(result != null);
    assert(!Array.isArray(result));

    return result;
}

describe("maybeSerializeMdxContent", () => {
    describe("custom html", () => {
        it("should render custom html", async () => {
            const result = await renderMdxContent("<div>Hello world!</div>");
            expect(result.type).toBe("div");
            expect(result.children).toEqual(["Hello world!"]);
        });

        it("should render custom html with JSX", async () => {
            const result = await renderMdxContent('<div style={{ display: "none" }}>Hello world!</div>');
            expect(result.type).toBe("div");
            expect(result.props.style).toEqual({ display: "none" });
        });

        it("should render custom html with className", async () => {
            const result = await renderMdxContent('<div className="testing">Hello world!</div>');
            expect(result.type).toBe("div");
            expect(result.props.className).toEqual("testing");
        });

        it("should render custom html with className 2", async () => {
            const result = await renderMdxContent('<div class="testing">Hello world!</div>');
            expect(result.type).toBe("div");
            expect(result.props.className).toEqual("testing");
        });

        it("should render custom html with CSS styles", async () => {
            const result = await renderMdxContent('<div style="display: none">Hello world!</div>');
            expect(result.type).toBe("div");
            expect(result.props.style).toEqual({ display: "none" });
        });
    });

    describe("headings", () => {
        it("should generate automatic anchor link", async () => {
            const result = await renderMdxContent("### Hello world!");
            expect(result.type).toBe("h3");
            expect(result.props.id).toBe("hello-world");
        });

        it("should generate with automatic anchor link with special letters", async () => {
            const result = await renderMdxContent("### Hello world ✅");
            expect(result.type).toBe("h3");
            expect(result.props.id).toBe("hello-world-");
        });

        it("should generate with a custom anchor link", async () => {
            const mdxContent = "### Hello world! [#custom-anchor]";

            const result = await renderMdxContent(mdxContent);

            expect(result.type).toBe("h3");
            expect(result.props.id).toBe("custom-anchor");
        });
    });
});
