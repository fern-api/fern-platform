import isPlainObject from "@fern-api/ui-core-utils/isPlainObject";
import unknownToString from "@fern-api/ui-core-utils/unknownToString";
import { valueToEstree } from "estree-util-value-to-estree";
import type { Element, ElementContent, Node, Root, RootContent, Text } from "hast";
import type {
    MdxJsxAttribute,
    MdxJsxAttributeValueExpression,
    MdxJsxExpressionAttribute,
    MdxJsxFlowElementHast,
} from "mdast-util-mdx-jsx";

export function isMdxJsxFlowElement(node: Node): node is MdxJsxFlowElementHast {
    return node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
}

export function isMdxJsxAttribute(
    attribute: MdxJsxAttribute | MdxJsxExpressionAttribute,
): attribute is MdxJsxAttribute {
    return attribute.type === "mdxJsxAttribute";
}

export function isElementContent(value: unknown): value is ElementContent {
    return (
        isPlainObject(value) &&
        "type" in value &&
        (value.type === "element" || value.type === "text" || value.type === "comment")
    );
}

export function isElement(value: ElementContent | Element | Root | RootContent | null | undefined): value is Element {
    return value ? value.type === "element" : false;
}

export function isText(value: ElementContent | Element | Root | RootContent | null | undefined): value is Text {
    return value ? value.type === "text" : false;
}

export function toAttribute(key: string, value: unknown): MdxJsxAttribute {
    return {
        type: "mdxJsxAttribute",
        name: key,
        value:
            typeof value === "string" || value == null
                ? value
                : {
                      type: "mdxJsxAttributeValueExpression",
                      value: unknownToString(value),
                      data: {
                          estree: {
                              type: "Program",
                              body: [
                                  {
                                      type: "ExpressionStatement",
                                      expression: valueToEstree(value),
                                  },
                              ],
                              sourceType: "module",
                          },
                      },
                  },
    };
}

export function getBooleanValue(
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
