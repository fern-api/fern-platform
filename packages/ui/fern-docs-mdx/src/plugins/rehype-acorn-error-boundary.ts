import type { Root } from "hast";
import { visit } from "unist-util-visit";
import { unknownToMdxJsxAttribute } from "../mdx-utils/unknown-to-mdx-jsx-attr";

interface AcornErrorBoundaryOptions {
    errorBoundaryComponentName?: string;
}

/**
 * This is an additional safeguard to ensure that any acorn expressions that are not valid does not throw an error in the final output.
 *
 * Requirement: `FernErrorBoundary` is globally available with `fallback` string property
 */
export function rehypeAcornErrorBoundary({
    errorBoundaryComponentName = "FernErrorBoundary",
}: AcornErrorBoundaryOptions = {}): (tree: Root) => void {
    return (root) => {
        visit(root, (node, index, parent) => {
            if (index == null || parent == null) {
                return;
            }
            if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
                parent.children[index] = {
                    type: "mdxJsxFlowElement",
                    name: errorBoundaryComponentName,
                    children: [node],
                    attributes: [unknownToMdxJsxAttribute("fallback", `{${node.value}}`)],
                };
                return "skip";
            }
            return;
        });
    };
}
