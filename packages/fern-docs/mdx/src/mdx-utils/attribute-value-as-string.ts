import type { MdxJsxAttributeValueExpression } from "mdast-util-mdx-jsx";

export function extractAttributeValueAsString(
  valueExpression: MdxJsxAttributeValueExpression | string | null | undefined
): string | undefined {
  if (!valueExpression) {
    return undefined;
  }
  if (typeof valueExpression === "string") {
    return valueExpression;
  } else if (
    valueExpression.value.trim().match(/^"[^"]+"$/) ||
    valueExpression.value.trim().match(/^'[^']+'$/)
  ) {
    return valueExpression.value.slice(1, -1);
  }
  return undefined;
}
