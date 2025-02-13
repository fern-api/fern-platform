import type { Root } from "hast";
import { CONTINUE, visit } from "unist-util-visit";

import { isMdxExpression, isMdxJsxElementHast } from "../mdx-utils";
import { unknownToMdxJsxAttribute } from "../mdx-utils/unknown-to-mdx-jsx-attr";
import { Unified } from "../unified";

interface AcornErrorBoundaryOptions {
  errorBoundaryComponentName?: string;
}

/**
 * This is an additional safeguard to ensure that any acorn expressions that are not valid does not throw an error in the final output.
 *
 * Requirement: `ErrorBoundary` is globally available with `fallback` string property
 */
export const rehypeAcornErrorBoundary: Unified.Plugin<
  [AcornErrorBoundaryOptions?],
  Root
> = ({ errorBoundaryComponentName = "ErrorBoundary" } = {}) => {
  return (root) => {
    visit(root, (node, index, parent) => {
      if (index == null || parent == null) {
        return CONTINUE;
      }

      if (isMdxExpression(node)) {
        parent.children[index] = {
          type: "mdxJsxFlowElement",
          name: errorBoundaryComponentName,
          children: [node],
          attributes: [unknownToMdxJsxAttribute("fallback", `{${node.value}}`)],
        };
      }

      if (isMdxJsxElementHast(node)) {
        parent.children[index] = {
          type: "mdxJsxFlowElement",
          name: errorBoundaryComponentName,
          children: [node],
          attributes: [],
        };
      }

      return CONTINUE;
    });
  };
};
