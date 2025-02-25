import { Hast, MdxJsxAttribute, isMdxJsxAttribute } from "@fern-docs/mdx";
import { setDimension } from "../plugins/rehype-files";

describe("setDimension", () => {
  it("should preserve image with both width and height set", () => {
    const node = createElement(100, 100);
    const attributes = node.attributes.filter(isMdxJsxAttribute);
    setDimension(node, attributes, 200, 200);
    const setAttr = node.attributes.filter(isMdxJsxAttribute);
    const attrWidth = setAttr.find((attr) => attr.name === "width");
    const attrHeight = setAttr.find((attr) => attr.name === "height");
    expect(attrWidth?.value).toEqual("100");
    expect(attrHeight?.value).toEqual("100");
  });

  it("should properly assign width when only height is set", () => {
    const node = createElement(undefined, 100);
    const attributes = node.attributes.filter(isMdxJsxAttribute);
    setDimension(node, attributes, 200, 200);
    const setAttr = node.attributes.filter(isMdxJsxAttribute);
    const attrWidth = setAttr.find((attr) => attr.name === "width");
    const attrHeight = setAttr.find((attr) => attr.name === "height");
    expect(attrWidth?.value).toEqual("100");
    expect(attrHeight?.value).toEqual("100");
  });

  it("should properly assign height when only width is set", () => {
    const node = createElement(100, undefined);
    const attributes = node.attributes.filter(isMdxJsxAttribute);
    setDimension(node, attributes, 200, 200);
    const setAttr = node.attributes.filter(isMdxJsxAttribute);
    const attrWidth = setAttr.find((attr) => attr.name === "width");
    const attrHeight = setAttr.find((attr) => attr.name === "height");
    expect(attrWidth?.value).toEqual("100");
    expect(attrHeight?.value).toEqual("100");
  });

  it("should set width and height when neither is set", () => {
    const node = createElement();
    const attributes = node.attributes.filter(isMdxJsxAttribute);
    setDimension(node, attributes, 200, 200);
    const setAttr = node.attributes.filter(isMdxJsxAttribute);
    const attrWidth = setAttr.find((attr) => attr.name === "width");
    const attrHeight = setAttr.find((attr) => attr.name === "height");
    expect(attrWidth?.value).toEqual("200");
    expect(attrHeight?.value).toEqual("200");
  });
});

function createElement(width?: number, height?: number): Hast.MdxJsxElement {
  const props: MdxJsxAttribute[] = [];

  if (width) {
    props.push({
      type: "mdxJsxAttribute",
      name: "width",
      value: `${width}`,
    });
  }

  if (height) {
    props.push({
      type: "mdxJsxAttribute",
      name: "height",
      value: `${height}`,
    });
  }
  return {
    type: "mdxJsxFlowElement",
    name: "img",
    attributes: [
      {
        type: "mdxJsxAttribute",
        name: "src",
        value: "file:123",
      },
      ...props,
    ],
    children: [],
    data: { _mdxExplicitJsx: true },
  };
}
