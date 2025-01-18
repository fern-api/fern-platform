import { h } from "hastscript";
import type {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
} from "mdast-util-mdx";
import type { MdxJsxElementHast } from "../declarations";
import { unknownToMdxJsxAttributeValue } from "../mdx-utils";

interface MdxJsxElementHastAttributes {
  /**
   * named props
   */
  props: Record<string, MdxJsxAttribute["value"]>;

  /**
   * expression (i.e. spreaded props)
   */
  expressions: MdxJsxExpressionAttribute["value"][];
}

export function hastMdxJsxElementHastToProps(
  element: MdxJsxElementHast
): MdxJsxElementHastAttributes {
  const props: Record<string, MdxJsxAttribute["value"]> = {};
  const expressions: MdxJsxExpressionAttribute["value"][] = [];

  element.attributes.forEach((attr) => {
    if (attr.type === "mdxJsxAttribute") {
      props[attr.name] = attr.value;
    } else if (attr.type === "mdxJsxExpressionAttribute") {
      expressions.push(attr.value);
    }
  });

  if (element.children.length > 0) {
    // Note: this is a blanket assumption that all child text nodes should be wrapped in a <p> tag
    // before removing this assumption, test against real-world examples for correctness
    props.children = unknownToMdxJsxAttributeValue(
      element.children.map((child) =>
        child.type === "text" ? h("p", child) : child
      )
    );
  }

  return { props, expressions };
}
