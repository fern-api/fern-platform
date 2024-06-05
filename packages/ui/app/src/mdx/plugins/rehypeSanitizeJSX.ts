import type { JSXFragment } from "estree-jsx";
import { SKIP as ESTREE_SKIP, visit as visitEstree } from "estree-util-visit";
import type { ElementContent, Root } from "hast";
import { SKIP, visit } from "unist-util-visit";
import { parseStringStyle } from "../../util/parseStringStyle.js";
import { INTRINSIC_JSX_TAGS } from "../common/intrinsict-elements.js";
import { JSX_COMPONENTS } from "../mdx-components.js";
import { isMdxJsxFlowElement, toAttribute } from "./utils.js";

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
                            visitEstree(attr.value.data.estree, (esnode, _key, i, ancestors) => {
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
                                    if (ancestor.type === "JSXFragment" && i != null) {
                                        ancestor.children[i] = jsxFragment();
                                    }
                                }
                                return undefined;
                            });
                        }

                        return attr;
                    });

                    // const temporaryRoot: Root = {
                    //     type: "root",
                    //     children: node.children,
                    // };
                    // rehypeSanitizeJSX({ showErrors })(temporaryRoot);
                    // node.children = temporaryRoot.children as ElementContent[];
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

        // strip acorns
        // TODO: exclude this logic if acorn matches scope (once we use scopes)
        visit(tree, (node, index, parent) => {
            if (index == null) {
                return;
            }
            if (node.type === "mdxTextExpression") {
                parent?.children.splice(index, 1, {
                    type: "text",
                    value: `{${node.value}}`,
                });
            }
        });
    };
}

// function toProperties(attributes: (MdxJsxAttribute | MdxJsxExpressionAttribute)[]): Record<string, string> | undefined {
//     const properties: Record<string, string> = {};
//     for (const attr of attributes) {
//         if (attr.type === "mdxJsxAttribute" && attr.value != null) {
//             if (typeof attr.value === "string") {
//                 properties[attr.name] = attr.value;
//             } else {
//                 console.log(attr);
//                 // todo: handle literal expressions
//                 return undefined;
//             }
//         } else if (attr.type === "mdxJsxExpressionAttribute") {
//             return undefined;
//         }
//     }
//     return properties;
// }

function mdxErrorBoundary(nodeName: string): ElementContent {
    return {
        type: "mdxJsxFlowElement",
        name: "MdxErrorBoundary",
        attributes: [toAttribute("error", `Unsupported JSX tag: <${nodeName} />`)],
        children: [],
    };
}

function jsxFragment(): JSXFragment {
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
