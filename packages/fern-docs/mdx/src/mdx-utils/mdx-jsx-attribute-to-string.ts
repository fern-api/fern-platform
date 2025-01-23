import type { MdxJsxAttribute } from "mdast-util-mdx-jsx";

export function mdxJsxAttributeToString(
  attribute: MdxJsxAttribute
): string | undefined {
  if (typeof attribute.value === "string") {
    return attribute.value;
  }

  if (
    typeof attribute.value === "object" &&
    attribute.value?.type === "mdxJsxAttributeValueExpression"
  ) {
    const expression = attribute.value.value;

    // if expression is wrapped in "" or '', then return the value inside
    if (expression.startsWith('"') && expression.endsWith('"')) {
      return expression.slice(1, -1);
    }

    if (expression.startsWith("'") && expression.endsWith("'")) {
      return expression.slice(1, -1);
    }

    // if the expression is wrapped in backticks, we cannot parse it, because it may contain a variable.
    // for now, we'll just return undefined.
  }

  return undefined;
}
