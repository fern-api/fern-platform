import type {
  MdxJsxAttribute,
  MdxJsxAttributeValueExpression,
  MdxJsxExpressionAttribute,
} from "mdast-util-mdx";

import { isPlainObject } from "@fern-api/ui-core-utils";

export function isMdxJsxAttributeValueExpression(
  value: unknown
): value is MdxJsxAttributeValueExpression {
  return (
    isPlainObject(value) && value.type === "mdxJsxAttributeValueExpression"
  );
}

export function isMdxJsxAttribute(
  attribute: MdxJsxAttribute | MdxJsxExpressionAttribute
): attribute is MdxJsxAttribute {
  return attribute.type === "mdxJsxAttribute";
}
