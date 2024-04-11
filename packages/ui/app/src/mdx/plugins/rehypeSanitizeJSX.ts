import type { Expression } from "estree";
import { SKIP as ESTREE_SKIP, visit as visitEstree } from "estree-util-visit";
import type { ElementContent, Root } from "hast";
import { SKIP, visit } from "unist-util-visit";
import { parseStringStyle } from "../../util/parseStringStyle";
import { INTRINSIC_JSX_TAGS } from "../common/intrinsict-elements";
import { JSX_COMPONENTS } from "../mdx-components";
import { isMdxJsxFlowElement, toAttribute } from "./utils";

export function rehypeSanitizeJSX({ showErrors = false }: { showErrors?: boolean } = {}): (tree: Root) => void {
    const SUPPORTED_JSX_TAGS = [...Object.keys(JSX_COMPONENTS), ...INTRINSIC_JSX_TAGS];
    return function (tree: Root): void {
        visit(tree, (node, index, parent) => {
            if (index == null) {
                return;
            }

            if (isMdxJsxFlowElement(node)) {
                if (node.name != null && !SUPPORTED_JSX_TAGS.includes(node.name)) {
                    if (!showErrors) {
                        parent?.children.splice(index, 1);
                    } else {
                        parent?.children.splice(index, 1, mdxErrorBoundary(node.name));
                    }
                    return SKIP;
                } else {
                    node.attributes = node.attributes.map((attr) => {
                        if (
                            attr.type === "mdxJsxAttribute" &&
                            typeof attr.value !== "string" &&
                            attr.value?.type === "mdxJsxAttributeValueExpression" &&
                            attr.value.data?.estree != null
                        ) {
                            visitEstree(attr.value.data.estree, (esnode, _key, _i, ancestors) => {
                                if (ancestors.length === 0) {
                                    return undefined;
                                }
                                if (
                                    esnode.type === "JSXElement" &&
                                    esnode.openingElement.name.type === "JSXIdentifier" &&
                                    !SUPPORTED_JSX_TAGS.includes(esnode.openingElement.name.name)
                                ) {
                                    const ancestor = ancestors[ancestors.length - 1];
                                    if (ancestor.type === "ExpressionStatement") {
                                        ancestor.expression = jsxFragment();
                                        return ESTREE_SKIP;
                                    }
                                }
                                return undefined;
                            });
                        }

                        return attr;
                    });
                }
            }
            return;
        });

        visit(tree, (node) => {
            if (isMdxJsxFlowElement(node)) {
                node.attributes = node.attributes.map((attr) => {
                    if (attr.type === "mdxJsxAttribute") {
                        // convert class to className
                        if (attr.name === "class") {
                            return { ...attr, name: "className" };
                        }

                        // if the style attribute is a string, convert it to an object
                        if (attr.name === "style") {
                            if (typeof attr.value === "string") {
                                return toAttribute("style", parseStringStyle(attr.value));
                            }
                        }
                    }

                    return attr;
                });
            }
        });
    };
}

function mdxErrorBoundary(nodeName: string): ElementContent {
    return {
        type: "mdxJsxFlowElement",
        name: "MdxErrorBoundary",
        attributes: [toAttribute("error", `Unsupported JSX tag: <${nodeName} />`)],
        children: [],
    };
}

function jsxFragment(): Expression {
    return {
        type: "JSXFragment",
        openingFragment: {
            type: "JSXOpeningFragment",
        },
        closingFragment: {
            type: "JSXClosingFragment",
        },
        children: [],
    };
}
