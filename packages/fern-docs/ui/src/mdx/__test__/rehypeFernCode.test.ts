import type { Hast } from "@fern-docs/mdx";
import { parseBlockMetaString } from "../plugins/rehypeFernCode";

describe("parseBlockMetaString", () => {
  it("should parse block meta string with empty string", () => {
    const node = createElement("");
    const meta = parseBlockMetaString(node);
    expect(meta.lang).toEqual("plaintext");
    expect(meta.highlights).toEqual([]);
    expect(meta.focused).not.toBe(true);
    expect(meta.maxLines).toEqual(20);
    expect(meta.title).toBeUndefined();
    expect(meta.wordWrap).not.toBe(true);
  });

  it("should parse block meta string", () => {
    const node = createElement(
      "{1,2,3} focused maxLines=5 title='title'",
      "typescript"
    );
    const meta = parseBlockMetaString(node);
    expect(meta.lang).toEqual("typescript");
    expect(meta.highlights).toEqual([1, 2, 3]);
    expect(meta.focused).toEqual(true);
    expect(meta.maxLines).toEqual(5);
    expect(meta.title).toEqual("title");
    expect(meta.wordWrap).not.toBe(true);
  });

  it("should parse block meta string with double quotes", () => {
    const node = createElement(
      '{1,2,3} focused maxLines=5 title="title"',
      "typescript"
    );
    const meta = parseBlockMetaString(node);
    expect(meta.lang).toEqual("typescript");
    expect(meta.highlights).toEqual([1, 2, 3]);
    expect(meta.focused).toEqual(true);
    expect(meta.maxLines).toEqual(5);
    expect(meta.title).toEqual("title");
    expect(meta.wordWrap).not.toBe(true);
  });

  it("should parse block meta string with empty highlights", () => {
    const node = createElement(
      "{ } focused maxLines=5 title='title'",
      "typescript"
    );
    const meta = parseBlockMetaString(node);
    expect(meta.lang).toEqual("typescript");
    expect(meta.highlights).toEqual([]);
    expect(meta.focused).toEqual(true);
    expect(meta.maxLines).toEqual(5);
    expect(meta.title).toEqual("title");
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
    expect(meta.highlights).toEqual([1, 2, 3]);
  });

  it("should parse match language if present", () => {
    const node = createElement("for='language'");
    const meta = parseBlockMetaString(node);
    expect(meta.matchLanguage).toEqual("language");
  });

  it("should parse match language using double quotes", () => {
    const node = createElement('for="language"');
    const meta = parseBlockMetaString(node);
    expect(meta.matchLanguage).toEqual("language");
  });

  it("should parse unidentified title if match language is specified", () => {
    const node = createElement("title for='language'");
    const meta = parseBlockMetaString(node);
    expect(meta.matchLanguage).toEqual("language");
    expect(meta.title).toEqual("title");
  });

  /**
   * ``` wordWrap
   * a long sentence here
   * ```
   */
  it("should parse metastring containing wordWrap", () => {
    const node = createElement("wordWrap");
    const meta = parseBlockMetaString(node);
    expect(meta.wordWrap).toBe(true);
  });

  it("should ignore wordWrap where title contains wordWrap", () => {
    const node = createElement("title='wordWrap'");
    const meta = parseBlockMetaString(node);
    expect(meta.wordWrap).not.toBe(true);
    expect(meta.title).toBe("wordWrap");
  });

  it("should parse promptLines meta with single value", () => {
    const node = createElement("promptLines={1}");
    const meta = parseBlockMetaString(node);
    expect(meta.promptLines).toEqual([1]);
  });

  it("should parse promptLines meta with multiple values", () => {
    const node = createElement("promptLines={1,2,3}");
    const meta = parseBlockMetaString(node);
    expect(meta.promptLines).toEqual([1, 2, 3]);
  });

  it("should parse promptLines meta with spaces", () => {
    const node = createElement("promptLines={1, 2, 3}");
    const meta = parseBlockMetaString(node);
    expect(meta.promptLines).toEqual([1, 2, 3]);
  });

  it("should parse promptLines meta along with other properties", () => {
    const node = createElement("title='Example' promptLines={1,2} focused");
    const meta = parseBlockMetaString(node);
    expect(meta.promptLines).toEqual([1, 2]);
    expect(meta.title).toEqual("Example");
    expect(meta.focused).toBe(true);
  });

  it("should handle empty promptLines", () => {
    const node = createElement("promptLines={}");
    const meta = parseBlockMetaString(node);
    expect(meta.promptLines).toEqual([]);
  });

  it("should parse both promptLines and highlights", () => {
    const node = createElement("promptLines={1,2} {3,4,5}");
    const meta = parseBlockMetaString(node);
    expect(meta.promptLines).toEqual([1, 2]);
    expect(meta.highlights).toEqual([3, 4, 5]);
  });
  
  it("should parse both promptLines and highlights in the reverse order", () => {
    const node = createElement("{3,4,5} promptLines={1,2}");
    const meta = parseBlockMetaString(node);
    expect(meta.promptLines).toEqual([1, 2]);
    expect(meta.highlights).toEqual([3, 4, 5]);
  });

  it("should parse promptLines and highlights with other properties", () => {
    const node = createElement("title='Example' promptLines={1,2} {3,4} focused wordWrap");
    const meta = parseBlockMetaString(node);
    expect(meta.promptLines).toEqual([1, 2]);
    expect(meta.highlights).toEqual([3, 4]);
    expect(meta.title).toEqual("Example");
    expect(meta.focused).toBe(true);
    expect(meta.wordWrap).toBe(true);
  });
});

function createElement(metastring: string, lang = "plaintext"): Hast.Element {
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
