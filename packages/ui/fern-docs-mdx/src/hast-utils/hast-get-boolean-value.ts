import type { MdxJsxAttributeValueExpression } from "mdast-util-mdx-jsx";

export function hastGetBooleanValue(
    value: string | MdxJsxAttributeValueExpression | null | undefined,
): boolean | undefined {
    if (value == null) {
        return undefined;
    }

    if (typeof value === "string") {
        return value === "true" ? true : value === "false" ? false : undefined;
    }

    if (value.type === "mdxJsxAttributeValueExpression") {
        return value.value === "true" ? true : value.value === "false" ? false : undefined;
    }

    return undefined;
}
