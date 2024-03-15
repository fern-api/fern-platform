import { Root } from "hast";
import { visit } from "unist-util-visit";
import { INTRINSIC_JSX_TAGS } from "../common/intrinsict-elements";
import { JSX_COMPONENTS } from "../mdx-components";
import { valueToEstree } from "./to-estree";
import { isMdxJsxFlowElement, toAttribute } from "./utils";

export function rehypeSanitizeJSX(): (tree: Root) => void {
    const SUPPORTED_JSX_TAGS = [...Object.keys(JSX_COMPONENTS), ...INTRINSIC_JSX_TAGS];
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
