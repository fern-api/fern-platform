import type { Root } from "hast";
import { visit } from "unist-util-visit";
import { toAttribute } from "../hast-utils/utils.js";

/**
 * This is an additional safeguard to ensure that any acorn expressions that are not valid does not throw an error in the final output.
 *
 * Requirement: `FernErrorBoundary` is globally available with `fallback` string property
 */
export function rehypeAcornErrorBoundary(): (tree: Root) => void {
    return (root) => {
        visit(root, (node, index, parent) => {
            if (index == null || parent == null) {
                return;
            }
            if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
                parent.children[index] = {
                    type: "mdxJsxFlowElement",
                    name: "FernErrorBoundary",
                    children: [node],
                    attributes: [toAttribute("fallback", `{${node.value}}`)],
                };
                return "skip";
            }
            return;
        });
    };
}
