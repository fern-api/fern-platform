import { Hast, MdxJsxAttribute, isMdxJsxAttribute } from "@fern-docs/mdx";
import { setDimension } from "../plugins/rehype-files";

describe("setDimension", () => {
  it("should preserve image with both width and height set", () => {
    const node = createElement(100, 100);
    setDimension(node, node.attributes.filter(isMdxJsxAttribute), 200, 200);
    expect(node).toMatchSnapshot();
  });

  it("should properly assign width when only height is set", () => {
    const node = createElement(undefined, 100);
    setDimension(node, node.attributes.filter(isMdxJsxAttribute), 200, 200);
    expect(node).toMatchSnapshot();
  });

  it("should properly assign height when only width is set", () => {
    const node = createElement(100, undefined);
    setDimension(node, node.attributes.filter(isMdxJsxAttribute), 200, 200);
    expect(node).toMatchSnapshot();
  });

  it("should set width and height when neither is set", () => {
    const node = createElement();
    setDimension(node, node.attributes.filter(isMdxJsxAttribute), 200, 200);
    expect(node).toMatchSnapshot();
  });

  it("should leave node as-is if no intrinsic size is set", () => {
    const node = createElement();
    setDimension(
      node,
      node.attributes.filter(isMdxJsxAttribute),
      undefined,
      undefined
    );
    expect(node).toMatchSnapshot();
  });

  it("should do nothing with non-numeric strings", () => {
    const node = createElement("100px", "100px");
    setDimension(
      node,
      node.attributes.filter(isMdxJsxAttribute),
      undefined,
      undefined
    );
    expect(node).toMatchSnapshot();
  });
});

function createElement(
  width?: number | string,
  height?: number | string
): Hast.MdxJsxElement {
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
