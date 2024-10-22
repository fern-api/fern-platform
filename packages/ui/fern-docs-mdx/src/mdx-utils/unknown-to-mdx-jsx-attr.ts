import type { MdxJsxAttribute } from "mdast-util-mdx-jsx";
import { isMdxJsxAttributeValueExpression } from "./is-mdx-jsx-attr.js";
import { unknownToEstreeExpression } from "./unknown-to-estree-expression.js";

export function unknownToMdxJsxAttributeValue(value: unknown): MdxJsxAttribute["value"] {
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
