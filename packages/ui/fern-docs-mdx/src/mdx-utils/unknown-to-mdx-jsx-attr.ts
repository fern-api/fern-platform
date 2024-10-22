import type { MdxJsxAttribute } from "mdast-util-mdx-jsx";
import { isMdxJsxAttributeValueExpression } from "./is-mdx-jsx-attr.js";
import { unknownToEstreeExpression } from "./unknown-to-estree-expression.js";

export function unknownToMdxJsxAttributeValue(value: unknown): MdxJsxAttribute["value"] {
    if (typeof value === "string" || value == null) {
        return value;
    }

    if (isMdxJsxAttributeValueExpression(value)) {
        return value;
    }

    return {
        type: "mdxJsxAttributeValueExpression",
        value: "__expression__",
        data: {
            estree: {
                type: "Program",
                sourceType: "module",
                body: [{ type: "ExpressionStatement", expression: unknownToEstreeExpression(value) }],
            },
        },
    };
}

export function unknownToMdxJsxAttribute(key: string, value: unknown): MdxJsxAttribute {
    return {
        type: "mdxJsxAttribute",
        name: key,
        value: unknownToMdxJsxAttributeValue(value),
    };
}
