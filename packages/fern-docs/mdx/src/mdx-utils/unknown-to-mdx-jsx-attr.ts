import { toEstree } from "hast-util-to-estree";
import type { MdxJsxAttribute } from "mdast-util-mdx";
import { isHastElement, isHastText } from "../hast-utils";
import { isMdxJsxElementHast } from "./is-mdx-element";
import { isMdxJsxAttributeValueExpression } from "./is-mdx-jsx-attr";
import { unknownToEstreeExpression } from "./unknown-to-estree-expression";

export function unknownToMdxJsxAttributeValue(
  value: unknown
): MdxJsxAttribute["value"] {
  if (typeof value === "string" || value == null) {
    return value;
  }

  // if the value is already an expression, return it
  if (isMdxJsxAttributeValueExpression(value)) {
    return value;
  }

  // generate a new expression program
  return {
    type: "mdxJsxAttributeValueExpression",
    value: "__expression__",
    data: {
      estree:
        isHastElement(value) || isHastText(value) || isMdxJsxElementHast(value)
          ? toEstree(value)
          : {
              type: "Program",
              sourceType: "module",
              body: [
                {
                  type: "ExpressionStatement",
                  expression: unknownToEstreeExpression(value),
                },
              ],
            },
    },
  };
}

export function unknownToMdxJsxAttribute(
  key: string,
  value: unknown
): MdxJsxAttribute {
  return {
    type: "mdxJsxAttribute",
    name: key,
    value: unknownToMdxJsxAttributeValue(value),
  };
}
