import { Expression } from "estree";
import type { Element, ElementContent, Node, Root, RootContent, Text } from "hast";
import type { MdxJsxAttribute, MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";

export function isMdxJsxFlowElement(node: Node): node is MdxJsxFlowElementHast {
    return node.type === "mdxJsxFlowElement";
}

export function isElement(value: ElementContent | Element | Root | RootContent | null | undefined): value is Element {
    return value ? value.type === "element" : false;
}

export function isText(value: ElementContent | Element | Root | RootContent | null | undefined): value is Text {
    return value ? value.type === "text" : false;
}

export function toAttribute(key: string, stringValue: string, expression: Expression): MdxJsxAttribute {
    return {
        type: "mdxJsxAttribute",
        name: key,
        value: {
            type: "mdxJsxAttributeValueExpression",
            value: stringValue,
            data: {
                estree: {
                    type: "Program",
                    body: [
                        {
                            type: "ExpressionStatement",
                            expression,
                        },
                    ],
                    sourceType: "module",
                },
            },
        },
    };
}
