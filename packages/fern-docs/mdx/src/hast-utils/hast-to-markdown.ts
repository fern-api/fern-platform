import type { Root as HastRoot } from "hast";
import { State, toMdast } from "hast-util-to-mdast";

import { mdastToMarkdown } from "../mdast-utils/mdast-to-markdown";

export function hastToMarkdown(hast: HastRoot): string {
  const mdast = toMdast(hast, {
    nodeHandlers: {
      // pass through node types
      mdxFlowExpression: passThrough,
      mdxJsxFlowElement: passThrough,
      mdxJsxTextElement: passThrough,
      mdxTextExpression: passThrough,
      mdxjsEsm: passThrough,
    },
  });
  if (mdast.type !== "root") {
    throw new Error("Expected root node");
  }
  return mdastToMarkdown(mdast);
}

function passThrough(state: State, node: any) {
  const children = state.all(node);
  const newNode = { ...node, children };
  state.patch(node, newNode);
  return newNode;
}
