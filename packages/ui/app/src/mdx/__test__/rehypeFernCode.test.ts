import { Element } from "hast";
import { parseBlockMetaString } from "../plugins/rehypeFernCode";

describe("parseBlockMetaString", () => {
    it("should parse block meta string with empty string", () => {
        const node = createElement("");
        const meta = parseBlockMetaString(node);
        expect(meta).toEqual({
            lang: "plaintext",
            highlights: [],
            focused: false,
            maxLines: 20,
            title: undefined,
        });
    });

    it("should parse block meta string", () => {
        const node = createElement("{1,2,3} focused maxLines=5 title='title'", "typescript");
        const meta = parseBlockMetaString(node);
        expect(meta).toEqual({
            lang: "typescript",
            highlights: [1, 2, 3],
            focused: true,
            maxLines: 5,
            title: "title",
        });
    });

    it("should parse block meta string with empty highlights", () => {
        const node = createElement("{ } focused maxLines=5 title='title'", "typescript");
        const meta = parseBlockMetaString(node);
        expect(meta).toEqual({
            lang: "typescript",
            highlights: [],
            focused: true,
            maxLines: 5,
            title: "title",
        });
    });

    it("should parse title with escaped quotes", () => {
        const node = createElement("title='title\\'s'");
        const meta = parseBlockMetaString(node);
        expect(meta.title).toEqual("title's");
    });

    it("should parse title with escaped double quotes", () => {
        const node = createElement('title="title\'s"');
        const meta = parseBlockMetaString(node);
        expect(meta.title).toEqual("title's");
    });

    it("should parse title from metastring if nothing else matches", () => {
        const node = createElement("This is a title");
        const meta = parseBlockMetaString(node);
        expect(meta.title).toEqual("This is a title");
    });

    it("should parse metastring containing only highlightlines", () => {
        const node = createElement("{1-3}");
        const meta = parseBlockMetaString(node);
        expect(meta).toEqual({
            lang: "plaintext",
            highlights: [1, 2, 3],
            focused: false,
            maxLines: 20,
            title: undefined,
        });
    });
});

function createElement(metastring: string, lang: string = "plaintext"): Element {
    return {
        type: "element",
        tagName: "pre",
        properties: {
            className: [`language-${lang}`],
        },
        children: [],
        data: {
            meta: metastring,
        },
    };
}
