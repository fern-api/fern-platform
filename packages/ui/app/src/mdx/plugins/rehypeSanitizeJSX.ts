import { Root } from "hast";
import { visit } from "unist-util-visit";
import { JSX_COMPONENTS } from "../mdx-components";
import { valueToEstree } from "./to-estree";
import { isMdxJsxFlowElement, toAttribute } from "./utils";

const SUPPORTED_JSX_TAGS = Object.keys(JSX_COMPONENTS);

export function rehypeSanitizeJSX(): (tree: Root) => void {
    return function (tree: Root): void {
        visit(tree, (node, index, parent) => {
            if (index == null) {
                return;
            }

            if (isMdxJsxFlowElement(node) && node.name != null && !SUPPORTED_JSX_TAGS.includes(node.name)) {
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
        });
    };
}
