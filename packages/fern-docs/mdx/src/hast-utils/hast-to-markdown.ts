import type { Root as HastRoot } from "hast";
import { toMdast } from "hast-util-to-mdast";
import { mdastToMarkdown } from "../mdast-utils/mdast-to-markdown";

export function hastToMarkdown(
  hast: HastRoot,
  format: "mdx" | "md" = "mdx"
): string {
  const mdast = toMdast(hast, {
    nodeHandlers:
      format === "mdx"
        ? {
            // pass through node types
            mdxFlowExpression: (_state, node) => node,
            mdxJsxFlowElement: (_state, node) => node,
            mdxJsxTextElement: (_state, node) => node,
            mdxTextExpression: (_state, node) => node,
            mdxjsEsm: (_state, node) => node,
          }
        : undefined,
  });
  if (mdast.type !== "root") {
    throw new Error("Expected root node");
  }
  return mdastToMarkdown(mdast, format);
}
