import type { Root } from "hast";
import { visit } from "unist-util-visit";
import { parseStringStyle } from "../../util/parseStringStyle";
import { INTRINSIC_JSX_TAGS } from "../common/intrinsict-elements";
import { JSX_COMPONENTS } from "../mdx-components";
import { valueToEstree } from "./to-estree";
import { isMdxJsxFlowElement, toAttribute } from "./utils";

export function rehypeSanitizeJSX({ showErrors = false }: { showErrors?: boolean } = {}): (tree: Root) => void {
    const SUPPORTED_JSX_TAGS = [...Object.keys(JSX_COMPONENTS), ...INTRINSIC_JSX_TAGS];
    return function (tree: Root): void {
        visit(tree, (node, index, parent) => {
            if (index == null) {
                return;
            }

            if (isMdxJsxFlowElement(node) && node.name != null && !SUPPORTED_JSX_TAGS.includes(node.name)) {
                if (!showErrors) {
                    parent?.children.splice(index, 1);
                } else {
                    parent?.children.splice(index, 1, {
                        type: "mdxJsxFlowElement",
                        name: "MdxErrorBoundary",
                        attributes: [
                            toAttribute(
                                "error",
                                `Unsupported JSX tag: <${node.name} />`,
                                valueToEstree(`Unsupported JSX tag: <${node.name} />`),
                            ),
                        ],
                        children: [],
                    });
                }
            }
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
                                return toAttribute("style", attr.value, valueToEstree(parseStringStyle(attr.value)));
                            }
                        }
                    }

                    return attr;
                });
            }
        });
    };
}
